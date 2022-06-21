
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
    const chunk = await upsertChunk(chunk1.payload, cfg1, context.logger);
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
    try {
      const chunk = await upsertChunk(chunk1.payload, cfg1, context.logger);
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      expect(err).to.have.property('status');
      expect(err.status).to.equal(500);
    }
  });
});

describe('Triggers - getChunksPolling', () => {
  const context = {
    logger: {
      info: (msg) => { console.info(msg); },
      debug: (msg) => { console.debug(msg); },
      error: (msg) => { console.error(msg); },
    },
  };
  it('should get all valid chunks', async () => {
    const ilaId = '123asd';
    const snapshot = { lastUpdated: (new Date(0)).toISOString() };
    const chunks = await getChunks({ ilaId }, snapshot, context.logger);
    expect(chunks.data).to.have.lengthOf(1);
    expect(chunks.data[0].ilaId).to.equal('123asd');
    expect(chunks.data[0].cid).to.equal('email');
    expect(chunks.data[0].def.domainId).to.equal('addresses');
    expect(chunks.data[0].payload.firstName).to.equal('Mark');
    expect(chunks.data[0].payload.lastName).to.equal('Smith');
    expect(chunks.data[0].payload.email).to.equal('smith@mail.com');
    expect(chunks.data[0].valid).to.be.true;
  });

  it('should retun 404 if no chunks found', async () => {
    const ilaId = '123asd';
    const snapshot = { lastUpdated: (new Date(0)).toISOString() };
    try {
      const chunks = await getChunks({ ilaId }, snapshot, context.logger);
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      expect(err).to.have.property('status');
      expect(err.status).to.equal(404);
    }
  });
});
