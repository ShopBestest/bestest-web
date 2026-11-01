// Cloudflare Worker entry.
import { createHandler, type Env } from './app.js';

const handler = createHandler();

export default {
  fetch: (request: Request, env: Env): Promise<Response> => handler(request, env)
};
