import type { EnvMode } from '@/types/constants.js';
import { startSystem } from './startSystem';

const ROOT_DIR = process.env.ROOT_DIR as string;
const ENV_MODE = process.env.ENV_MODE as unknown as EnvMode;
const FILES_UID = process.env.FILES_UID as string;
const FILES_GID = process.env.FILES_GID as string;
const EXT_DIRS = process.env.EXT_DIRS as string;
const JUST_INSTALLED =
  typeof process.env.JUST_INSTALLED === 'string'
    ? process.env.JUST_INSTALLED === 'true'
    : false;

startSystem(
  ROOT_DIR,
  ENV_MODE,
  FILES_UID,
  FILES_GID,
  EXT_DIRS,
  JUST_INSTALLED
).catch((e) => {
  console.error(e);
  process.exit(1);
});
