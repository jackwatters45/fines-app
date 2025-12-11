import { devStage, prodStage, stage } from './stage';

export const PRODUCTION = 'fines.laxdb.io';
export const DEV = 'dev.fines.laxdb.io';

export const permanentDomain = stage === prodStage ? PRODUCTION : DEV;

export const domain =
  stage === prodStage
    ? PRODUCTION
    : stage === devStage
      ? DEV
      : `${stage}.${DEV}`;
