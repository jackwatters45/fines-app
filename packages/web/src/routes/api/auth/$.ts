import { env } from 'cloudflare:workers';
import { createAuth } from '@fines-app/core/auth';
import { createDb } from '@fines-app/core/drizzle/index';
import { createFileRoute } from '@tanstack/react-router';

const handler = (request: Request) => {
  const db = createDb(env.DB);
  const { auth } = createAuth({ db, kv: env.KV });
  return auth.handler(request);
};

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => handler(request),
      POST: ({ request }) => handler(request),
    },
  },
});
