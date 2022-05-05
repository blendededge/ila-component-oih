
/* eslint no-unused-expressions: "off" */
/* eslint max-len: "off" */
/* eslint no-underscore-dangle: "off" */
/* eslint no-unused-vars: "off" */

const { expect } = require('chai');
const { upsertChunk } = require('./../dist/actions/upsertChunk.js');
const { getChunks } = require('./../dist/triggers/getChunksPolling.js');
const { chunk1, cfg1 } = require('./seed/chunk.seed');

describe('Actions - upsertChunk', () => {
  it('should upsert a chunk', async () => {
    const context = {
      logger: {
        info: () => {},
        debug: () => {},
        error: () => {},
      },
    };
    const chunk = await upsertChunk.bind(context, chunk1.payload, cfg1);
    expect(chunk).to.have.keys('data', 'meta');
    expect(chunk.data.ilaId).to.equal('123asd');
    expect(chunk.data.cid).to.equal('email');
    expect(chunk.data.valid).to.be.false;
    expect(chunk.data.payload.firstName).to.equal('John');
    expect(chunk.data.payload.email).to.equal('doe@mail.com');
  });

  it('should return 500 if internal server error', async () => {
    const context = {
      logger: {
        info: () => {},
        debug: () => {},
        error: () => {},
      },
    };
    const chunk = await upsertChunk.bind(context, chunk1.payload, cfg1);
    expect(chunk.error).to.have.keys('errors');
    expect(chunk.error.errors[0].message).to.equal('Server error!');
    expect(chunk.statusCode).to.equal(500);
  });
});

describe('Triggers - getChunksPolling', () => {
  it('should get all valid chunks', async () => {
    const ilaId = '123asd';
    const snapshot = { lastUpdated: (new Date(0)).toISOString() };
    const chunks = await getChunks(ilaId, snapshot);
    expect(chunks).to.have.lengthOf(1);
    expect(chunks[0].ilaId).to.equal('123asd');
    expect(chunks[0].cid).to.equal('email');
    expect(chunks[0].def.domainId).to.equal('addresses');
    expect(chunks[0].payload.firstName).to.equal('Mark');
    expect(chunks[0].payload.lastName).to.equal('Smith');
    expect(chunks[0].payload.email).to.equal('smith@mail.com');
    expect(chunks[0].valid).to.be.true;
  });

  it('should retun 404 if no chunks found', async () => {
    const ilaId = '123asd';
    const snapshot = { lastUpdated: (new Date(0)).toISOString() };
    const chunks = await getChunks(ilaId, snapshot);
    expect(chunks).to.have.keys('errors');
    expect(chunks.errors[0].message).to.equal('No chunks found!');
    expect(chunks.errors[0].code).to.equal(404);
  });
});
