import type { Session, User } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  admin,
  lastLoginMethod,
  openAPI,
  organization,
} from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { Effect } from 'effect';
import type { Database } from './drizzle';
import { AuthenticationError } from './error';

type AuthBindings = {
  db: Database;
  kv: KVNamespace;
};

export const createAuth = ({ db, kv }: AuthBindings) => {
  const auth = betterAuth({
    appName: 'Goalbound',
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
    },
    rateLimit: {
      window: 10, // time window in seconds
      max: 100, // max requests in the window
      storage: 'secondary-storage',
    },
    secondaryStorage: {
      get: (key) => kv.get(key),
      set: (key, value, ttl) =>
        kv.put(key, value, { expirationTtl: ttl ?? Number.POSITIVE_INFINITY }),
      delete: (key) => kv.delete(key),
    },
    plugins: [
      admin(),
      organization({
        teams: { enabled: true },
      }),
      openAPI(),
      lastLoginMethod(),
      tanstackStartCookies(),
    ],
  });

  return {
    auth, // export base auth
    getSession: (headers: Headers) =>
      Effect.tryPromise(async () => {
        const session: { session: Session; user: User } | null =
          await auth.api.getSession({ headers });

        return session;
      }).pipe(
        Effect.mapError(
          (cause) =>
            new AuthenticationError({
              cause,
              message: 'Failed to get session',
            })
        )
      ),
    getSessionOrThrow: (headers: Headers) =>
      Effect.tryPromise(async () => {
        const session: { session: Session; user: User } | null =
          await auth.api.getSession({ headers });

        return session;
      }).pipe(
        Effect.mapError(
          (cause) =>
            new AuthenticationError({
              cause,
              message: 'Failed to get session',
            })
        ),
        Effect.filterOrFail(
          (session) => !!session,
          () =>
            new AuthenticationError({
              message: 'Session is not valid',
            })
        )
      ),
    // getActiveOrganization: (headers: Headers) =>
    //   Effect.tryPromise(() => auth.api.getFullOrganization({ headers })).pipe(
    //     Effect.mapError(
    //       (cause) =>
    //         new OrganizationMembershipError({
    //           message: 'Failed to retrieve active organization from session',
    //           cause,
    //         })
    //     )
    //   ),
    // getActiveOrganizationOrThrow: (headers: Headers) =>
    //   Effect.tryPromise(() => auth.api.getFullOrganization({ headers })).pipe(
    //     Effect.mapError(
    //       (cause) =>
    //         new OrganizationMembershipError({
    //           message: 'Failed to retrieve active organization from session',
    //           cause,
    //         })
    //     ),
    //     Effect.filterOrFail(
    //       (org) => !!org,
    //       () =>
    //         new OrganizationMembershipError({
    //           message: 'No active organization found for the current session',
    //         })
    //     )
    //   ),
  } as const;
};
