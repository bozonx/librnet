import type { EnvMode, SystemEvents } from '@/types/constants.js';
import { startSystem } from './startSystem';

const ENV_MODE = process.env.ENV_MODE as unknown as EnvMode;
const ROOT_DIR = process.env.ROOT_DIR as string;
const FILES_UID = process.env.FILES_UID as string;
const FILES_GID = process.env.FILES_GID as string;
const EXT_DIRS = process.env.EXT_DIRS as string;

startSystem(
  ROOT_DIR,
  ENV_MODE,
  FILES_UID,
  FILES_GID,
  EXT_DIRS,
  // TODO: just installed
  true
).catch((e) => {
  console.error(e);
  process.exit(1);
});
