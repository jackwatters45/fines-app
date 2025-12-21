import { env } from 'cloudflare:workers';
import { createAuth } from '@fines-app/core/auth';
import { createDb } from '@fines-app/core/drizzle/index';
import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from '@/lib/middleware';

export const getSession = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => context.session);

export const logout = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = createDb(env.DB);
    const { auth } = createAuth({ db, kv: env.KV });

    if (context.session) {
      await auth.api.signOut({ headers: context.headers });
    }
  });
