import { R2Bucket } from 'alchemy/cloudflare';

export const storage = await R2Bucket('storage', {
  name: 'fines-app-storage',
});
