import {stage } from './stage';

export const PRODUCTION = 'fines.laxdb.io';
export const DEV = 'dev.fines.laxdb.io';

export const permanentDomain = stage === 'production' ? PRODUCTION : DEV;

export const domain =
  stage === 'production'
    ? PRODUCTION
    : stage === 'dev'
      ? DEV
      : `${stage}.${DEV}`;
