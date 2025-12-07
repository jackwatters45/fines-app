import alchemy from 'alchemy';

export const secret = {
  API_KEY: alchemy.secret('key'),
};

export const allSecrets = Object.values(secret);
