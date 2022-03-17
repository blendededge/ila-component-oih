import EventEmitter = require("events");

export interface Message {
  id: string;
  attachments: Record<string, unknown>;
  data: Record<string, unknown>;
  headers: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface UpsertConfig {
  ilsDomain?: string;
  ilaId: string;
  cid: string;
  def: any;
  expireInterval: number;
  token: string;
}

export interface PollConfig {
  ilsDomain?: string;
  ilaId: string;
}

export type Definition = Record<string, any>;

export interface Chunk {
  ilaId: string;
  cid: string;
  def: Definition;
  payload: Record<string, any>;
}

export interface ChunkRequest extends Chunk {
  token: string;
  expireInterval?: number;
}

export interface ChunkResponse extends Chunk {
  _id: string;
  expireAt: string;
}

export interface SuccessfulUpsertResponse {
  data: ChunkResponse
}

export interface ComponentLogger {
  fatal: (...data: any[]) => void;
  error: (...data: any[]) => void;
  warn: (...data: any[]) => void;
  info: (...data: any[]) => void;
  debug: (...args: any[]) => void;
  trace: (...data: any[]) => void;
}

export interface TaskExec extends EventEmitter {
  logger: ComponentLogger;
}
