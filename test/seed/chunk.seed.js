const nock = require('nock');

const chunk1 = {
  ilaId: '123asd',
  cid: 'email',
  def: {
    domainId: 'addresses',
    uri: 'http://metadata.openintegrationhub.com/domains/addresses/schema/uri',
  },
  payload: {
    lastName: 'Doe',
    email: 'doe@mail.com',
  },
};

const cfg1 = {
  ilaId: '567qwe',
  cid: 'email',
  def: {
    domainId: 'addresses',
    uri: 'http://metadata.openintegrationhub.com/domains/addresses/schema/uri',
  },
  token: '12345',
};

const upsertChunkSuccessful = nock('http://ils.oih-dev-ns.svc.cluster.local:3003/chunks')
  .post('')
  .reply(200, {
    data: {
      _id: '5ce7c1b06e83c63e5defb966',
      ilaId: '123asd',
      cid: 'email',
      payload: {
        firstName: 'John',
        email: 'doe@mail.com',
      },
      def: {
        domainId: 'addresses',
        uri: 'http://metadata.openintegrationhub.com/domains/addresses/schema/uri',
      },
      expireAt: '2019-05-24T11:05:01.201Z',
      valid: false,
      __v: 0,
    },
    meta: {},
  });

const upsertChunkFailed = nock('http://ils.oih-dev-ns.svc.cluster.local:3003/chunks')
  .post('')
  .reply(500, { errors: [{ message: 'Server error!', code: 500 }] });

const getChunksSuccessful = nock('http://ils.oih-dev-ns.svc.cluster.local:3003/chunks/123asd')
  .get('')
  .reply(200, {
    data: [{
      _id: '5ce7c1b06e83c63e5defb966',
      ilaId: '123asd',
      cid: 'email',
      payload: {
        firstName: 'Mark',
        lastName: 'Smith',
        email: 'smith@mail.com',
      },
      def: {
        domainId: 'addresses',
        uri: 'http://metadata.openintegrationhub.com/domains/addresses/schema/uri',
      },
      expireAt: '2019-05-24T11:05:01.201Z',
      valid: true,
      __v: 0,
    }],
    meta: { total: 1 },
  });

const getChunksFailed = nock('http://ils.oih-dev-ns.svc.cluster.local:3003/chunks/123asd')
  .get('')
  .reply(404, {
    data: [],
    meta: { },
  });

module.exports = {
  chunk1, cfg1, upsertChunkSuccessful, getChunksSuccessful, getChunksFailed, upsertChunkFailed,
};
