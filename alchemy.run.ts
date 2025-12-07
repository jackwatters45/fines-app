import alchemy from 'alchemy';
import { CloudflareStateStore } from 'alchemy/state';

const app = await alchemy('fines-app', {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

const infra = await import('./infra');

console.log({
  web: infra.web.url,
  database: infra.database.id,
});

await app.finalize();

export { infra };
