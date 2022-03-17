import * as uuid from 'uuid';
import { Message } from './types';

export function newMessage<T extends {}>(data: T): Message {
  return {
    id: uuid.v4(),
    attachments: {},
    headers: {},
    metadata: {},
    data: data
  };
}