import { env } from 'cloudflare:workers';
import { createAuth } from '@fines-app/core/auth';
import { createDb } from '@fines-app/core/drizzle/index';
import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const authMiddleware = createMiddleware({
  type: 'function',
}).server(async ({ next }) => {
  const request = getRequest();
  const { headers } = request;

  const db = createDb(env.DB);
  const { auth } = createAuth({ db, kv: env.KV });

  const session = await auth.api.getSession({ headers });

  if (!session) {
    const url = new URL(request.url);
    throw redirect({
      to: '/login',
      search: {
        redirectUrl: url.pathname,
      },
    });
  }

  return next({
    context: {
      session,
      headers,
    },
  });
});

export const logMiddleware = createMiddleware({ type: 'function' })
  .client(async (ctx) => {
    const clientStartTime = performance.now();

    const result = await ctx.next();

    const clientEndTime = performance.now();
    const roundTripTime = clientEndTime - clientStartTime;

    console.log('[Request]', {
      timestamp: new Date().toISOString(),
      roundTripMs: Math.round(roundTripTime * 100) / 100,
    });

    return result;
  })
  .server(async (ctx) => {
    const request = getRequest();
    const serverStartTime = performance.now();
    const url = new URL(request.url);

    const result = await ctx.next();

    const serverDuration = performance.now() - serverStartTime;

    console.log('[Server]', {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: url.pathname,
      search: url.search,
      contentLength: request.headers.get('content-length'),
      contentType: request.headers.get('content-type'),
      serverMs: Math.round(serverDuration * 100) / 100,
    });

    return result;
  });
