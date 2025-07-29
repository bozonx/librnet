# Librnet OS

Personal decentralised OS based on overlay network.

## Development

### Code Formatting

Проект использует Prettier с плагином `@trivago/prettier-plugin-sort-imports` для автоматической сортировки импортов.

#### Настройка сортировки импортов

Импорты автоматически сортируются в следующем порядке:

1. **Внешние импорты** из `node_modules` (например, `squidlet-lib`, `ws`, `yaml`)
2. **Локальные импорты** (относительные пути `../`, `./` и алиасы `@/`)

Между группами импортов добавляется пустая строка для лучшей читаемости.

#### Команды форматирования

```bash
# Форматировать все файлы в src/
pnpm format

# Проверить форматирование без изменений
pnpm format:check
```

#### Пример сортировки импортов

```typescript
// Внешние импорты из node_modules
import { ConsoleLogger, LogLevels } from 'squidlet-lib'
import { WebSocket } from 'ws'

// Локальные импорты (относительные пути и алиасы)
import { System } from '../system/System.js'
import { IoSetClient } from '@/ioSets/IoSetClient'
import { startSystemDev } from './startSystemDev'
```

Run in dev mode

```bash
npm run dev
```

## Test

Test IO

```bash
npx tsx ./_testIo/testFiles.ts
npx tsx ./_testIo/testHttp.ts
```

## Production

```bash
npm run build
```

In production mode the main config file `~/.config/librnet/config.json`
will be read. It contains the next parameters:

- ROOT_DIR which points to the root dir of librnet's files.
- FILES_UID
- FILES_GID

## Environment variables

- ROOT_DIR - if set then it will be used as a root dir instead of
  config file of user's home. It have to be an absolute.
- FILES_UID - uid for all the files on unix-like systems
- FILES_GID - gid for all the files on unix-like systems
- ENV_MODE - production, development or test

FILES_UID and FILES_GID are used for ROOT_DIR and default rights of external dirs


-------
-------




## File structure

* `/appFiles` - app files after install are put here. They will be readonly
  * `/[appName]`
* `/appDataLocal` - apps data which is only for current machine
  * `/[appName]`
  * `/system` - for system services and drivers
* `/appDataSynced` - apps data which is synced between app user's devices
  * `/[appName]`
  * `/system` - for system services and drivers
* `/cacheLocal` - local cache for all the apps and system
  * `/[appName]`
  * `/system` - for system services and drivers
  * `/common` - for anyone
* `/cfgLocal` - local configs for all the apps and system
  * `/[appName]`
  * `/system` - for system services and drivers
  * `/common` - for anyone
* `/cfgSynced` - synced configs for all the apps and system
  * `/[appName]`
  * `/system` - for system services and drivers
  * `/common` - for anyone
* `/db` - all databases of all the apps and system here. They are synced by db engine
  * `/[appName]`
  * `/system` - for system services and drivers
  * `/common` - for anyone
* `/log` - logs for all the apps and system. They are handled by log engine
  * `/[appName]`
  * `/system` - for system services and drivers
  * `/common` - for anyone
* `/tmpLocal` - tmp for all the apps and system. It is local
  * `/[appName]`
  * `/system` - for system services and drivers
  * `/common` - for anyone
* `/home` - common dir where user store his files. They are synced.
  User can select witch files sync between his machines.
  This is the only dir which is accessible outside squidlet.
  * `/.trash` - synced trash bin
  * `/.versions` - synced versions of changed files
  * `/_Apps/[appName]` - synced user data by app e.g. games save files
  * `/_Downloads` - synced dir for downloads
  * `/_Media` - synced images, videos, audio files and documents
  * `/_Mnt` - mount here external dirs or put symlinks (if allowed in config).
  * `/_Tmp` - synced user's tmp dir
    It is machine specific, not synced
  * `...` any other synced user's files

And there is a virtual dir `/external` which is used to have access to local
machine file.

## Start dev

    yarn dev


## Firefox addon

### Install locally

Go to about:debugging#/runtime/this-firefox and click "Load temporary addon".
And select src/starts/FirefoxStarter/addon/manifest.json

### Develop addon

    cd src/starts/FirefoxStarter/addon/
    web-ext run

## Android app


### Dev

* Install OpenJDK Java 11 console and shell (хз - jre11-openjdk)
* Install Android Studio
* Install SDK api 33
* Install SDK build tools - switch to tab "SDK tools", check show details and select build tools 30
* Run virtual phone

    
    cd ./src/starters/AndroidStarter/src
    # run to check an environment
    ns doctor android

    # run
    ns run android
    JAVA_HOME=/usr/lib/jvm/java-11-openjdk ns run android --scan

    ns debug android

## Install development build on Raspberry Pi like board

Prerequisite:

* Install nvm
* Clone repo
* go to project's directory


    sudo apt-get install pigpio
    nvm install
    nvm use
    yarn global add pigpio
    yarn

## Publish

    yarn test
    yarn build
    yarn publish
