import alchemy from 'alchemy';
import { GitHubComment } from 'alchemy/github';
import { CloudflareStateStore } from 'alchemy/state';

export const app = await alchemy('fines-app', {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

const infra = await import('./infra');

console.log({
  web: infra.web.url,
  db: infra.db.id,
});

console.log('PULL_REQUEST env:', process.env.PULL_REQUEST);

if (process.env.PULL_REQUEST) {
  // if this is a PR, add a comment to the PR with the preview URL
  // it will auto-update with each push
  await GitHubComment('preview-comment', {
    owner: 'jackwatters45',
    repository: 'fines-app',
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `
     ## 🚀 Preview Deployed

     Your changes have been deployed to a preview environment:

     **🌐 Website:** ${infra.web.url}

     Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

     ---
     <sub>🤖 This comment updates automatically with each push.</sub>`,
  });
}

await app.finalize();
