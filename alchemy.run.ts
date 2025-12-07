import alchemy from 'alchemy';
import { Tunnel } from 'alchemy/cloudflare';
import { CloudflareStateStore } from 'alchemy/state';

const app = await alchemy('fines-app', {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

const infra = await import('./infra');

console.log({
  web: infra.web.url,
  database: infra.database.id,
});

// Create a tunnel with ingress rules
const tunnel = await Tunnel('web-app', {
  name: 'web-app-tunnel',
  ingress: [
    {
      hostname: 'app.example.com',
      service: 'http://localhost:3000',
    },
    {
      service: 'http_status:404', // catch-all rule (required)
    },
  ],
});

// Display the tunnel token
console.log('Tunnel created!');
console.log('Token:', tunnel.token.unencrypted);

await app.finalize();

export { infra };
