import axios, { AxiosRequestConfig } from 'axios';
import { newMessage } from '../common/message';
import { ComponentLogger, Message, PollConfig, TaskExec } from '../common/types';
import { wrapper } from '@blendededge/ferryman-extensions'
import { IncomingHeaders, Snapshot, TokenData } from '@blendededge/ferryman-extensions/lib/ferryman-types';

/**
 * This method will be called from OIH providing following data
 *
 * @param msg incoming message object that contains `data` with payload
 * @param cfg configuration that is account information and configuration field values
 * @param snapshot saves the current state of integration step for the future reference
 */
async function processTrigger(this: TaskExec, msg: Message, cfg: PollConfig, snapshot: Snapshot, incomingMessageHeaders: IncomingHeaders, oihToken: TokenData, ) {
  const self = await wrapper(this, msg, cfg, snapshot, incomingMessageHeaders, oihToken);
  self.logger.debug('msg: ', JSON.stringify(msg));
  self.logger.debug('cfg: ', JSON.stringify(cfg));

  try {
    const result = await getChunks(cfg, {}, self.logger);
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

exports.process = processTrigger;

async function getChunks(cfg: PollConfig, snapshot: any, logger: ComponentLogger) {
  try {
    const domain = cfg.ilsDomain ? cfg.ilsDomain : 'http://ils.oih-dev-ns.svc.cluster.local:3003';
    const url = `${domain}/chunks/${cfg.ilaId}`;
    logger.info(`Upserting chunk to ${url}`);

    const requestConfig: AxiosRequestConfig = {
      url
    };

    const result = await axios(requestConfig);

    logger.info('response data: ', JSON.stringify(result.data, null, 2));

    return result.data;

  } catch (error) {
    logger.error(`ERROR getting chunks from ILS: ${JSON.stringify(error, null, 2)}`);
  }
}

exports.getChunks = getChunks;