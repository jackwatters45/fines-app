import alchemy from 'alchemy';
import { D1Database, KVNamespace, R2Bucket, TanStackStart } from 'alchemy/cloudflare';
import { GitHubComment } from 'alchemy/github';
import { CloudflareStateStore } from 'alchemy/state';

export const app = await alchemy('fines-app', {
  stateStore: (scope) =>
    new CloudflareStateStore(scope, { scriptName: `app-state-${scope.stage}` }),
});

// Stage
export const stage = app.stage;
export const prodStage = 'prod';
export const devStage = 'dev';
export const isPermanentStage = [prodStage, devStage].includes(stage);

// Domain
const PRODUCTION = 'fines.laxdb.io';
const DEV = 'dev.fines.laxdb.io';
export const domain =
  stage === prodStage ? PRODUCTION : stage === devStage ? DEV : `${stage}.${DEV}`;

// Resources
export const db = await D1Database('db', {
  migrationsDir: './packages/core/migrations',
  readReplication: { mode: 'auto' },
});

export const kv = await KVNamespace('kv', {});

export const storage = await R2Bucket('storage', {});

export const web = await TanStackStart('web', {
  bindings: {
    DB: db,
    KV: kv,
    STORAGE: storage,
  },
  cwd: './packages/web',
  domains: [domain],
});

console.log({
  domain,
  webWorkers: web.url,
  db: db.id,
  kv: kv.namespaceId,
  r2: storage.name,
  stage,
});

if (process.env.PULL_REQUEST) {
  await GitHubComment('preview-comment', {
    owner: 'jackwatters45',
    repository: 'fines-app',
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `
     ## 🚀 Preview Deployed

     Your changes have been deployed to a preview environment:

     **🌐 Website:** ${web.url}

     Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

     ---
     <sub>🤖 This comment updates automatically with each push.</sub>`,
  });
}

await app.finalize();
