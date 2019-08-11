import { IncomingMessage } from "http";

export type Context = {
	me?: { id: number };
	req: IncomingMessage;
};
