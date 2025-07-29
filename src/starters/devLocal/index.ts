import { startSystem } from './startSystemDev.js'
import { EnvModes } from '@/types/types.js'

const ROOT_DIR = process.env.ROOT_DIR as string
const FILES_UID = process.env.FILES_UID as unknown as number
const FILES_GID = process.env.FILES_GID as unknown as number
const ENV_MODE = process.env.ENV_MODE as unknown as EnvModes

startSystem(ROOT_DIR, FILES_UID, FILES_GID, ENV_MODE).catch((e) => {
  console.error(e)
  process.exit(2)
})
