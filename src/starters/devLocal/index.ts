import type { EnvModes } from '@/types/constants.js';
import { startSystem } from './startSystem.js';

const envMode = process.env.ENV_MODE as unknown as EnvModes;
const rootDir = process.env.ROOT_DIR as string;

startSystem(rootDir, envMode);
