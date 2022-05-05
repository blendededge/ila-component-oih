import axios, { AxiosRequestConfig } from 'axios';
import { Message, UpsertConfig, TaskExec, ComponentLogger, ChunkRequest } from '../common/types';
import { newMessage } from '../common/message';
/**
 * This method will be called from OIH providing following data
 *
 * @param msg incoming message object that contains `data` with payload
 * @param cfg configuration that is account information and configuration field values
 */
async function processAction(this: TaskExec, msg: Message, cfg: UpsertConfig) {
  const self = this;
  self.logger.debug('msg: ', msg);
  self.logger.debug('cfg: ', cfg);

  try {
    const result = await upsertChunk(msg, cfg, self.logger);
    emitData(newMessage(result));
  } catch (error) {
    emitError(error as Error);
  }

  emitEnd();

  function emitError(error: Error) {
    self.emit('rebound', error);
  }

  function emitData(data: any) {
    self.emit('data', data);
  }

  function emitEnd() {
    self.emit('end');
  }

}

exports.process = processAction;


async function upsertChunk(msg: Message, cfg: UpsertConfig, logger: ComponentLogger): Promise<any> {
  try {
    validateConfig(cfg);
    const domain = cfg.ilsDomain ? cfg.ilsDomain : 'http://ils.oih-dev-ns.svc.cluster.local:3003';
    const url = `${domain}/chunks`;
    logger.info(`Upserting chunk to ${url}`);

    // default expireInterval is 1 hour (60 * 60)
    const { ilaId, cid, def, expireInterval = 60 * 60, token } = cfg;
    const requestBody: ChunkRequest = {
      ilaId,
      cid,
      def,
      expireInterval,
      payload: msg.data,
      token
    };

    const requestConfig: AxiosRequestConfig = {
      url,
      method: 'post',
      data: requestBody
    };

    const result = await axios(requestConfig);

    logger.info('response data: ', JSON.stringify(result.data, null, 2));

    return result.data;

  } catch (error) {
    logger.error(`ERROR upserting chunk in ILS: ${JSON.stringify(error)}`);
    throw error;
  }
}
exports.upsertChunk = upsertChunk;

function validateConfig(cfg: UpsertConfig) {
  const requiredKeys = ['ilaId', 'cid', 'def', 'token'];
  requiredKeys.forEach((key) => {
    if (!(key in cfg)) {
      throw Error(`ILA component config missing required key "${key}"`);
    }
  });
}

