import { FILE_PERM_DELIMITER } from '@/packages/SystemCommonPkg/RootFilesDriver/RootFilesDriver.js'
import { FILE_ACTION } from '@/types/constants'

// TODO: при проходе вверх как будут отрабатывать слэши?

type CheckPermCb = (
  entityWhoAsk: string,
  permitForEntity: string,
  path: string
) => Promise<boolean>

export async function checkPermissions(
  checkPermCb: CheckPermCb,
  entityWhoAsk: string,
  permitForEntity: string,
  paths: string[],
  action: string
) {
  for (const path of paths) {
    if (path.indexOf('/') !== 0) {
      throw new Error(`Path has to start with "/": ${path}`)
    }

    const hasPermission = await checkPathAndParentPermissions(
      checkPermCb,
      entityWhoAsk,
      permitForEntity,
      path,
      action
    )

    if (!hasPermission) {
      throw new Error(`Path "${path}" is not allowed to be ${action}`)
    }
  }
}

/**
 * Проверяет права на указанный путь и его родительские директории
 * @param path - путь для проверки
 * @param action - действие (read/write)
 * @returns true если есть права на путь или любой из родительских путей
 */
async function checkPathAndParentPermissions(
  checkPermCb: CheckPermCb,
  entityWhoAsk: string,
  permitForEntity: string,
  path: string,
  action: string
): Promise<boolean> {
  // Проверяем права на сам путь
  if (
    await checkPathPermissions(
      checkPermCb,
      entityWhoAsk,
      permitForEntity,
      path,
      action
    )
  ) {
    return true
  }

  // Проверяем права на родительские директории
  const parentPaths = getParentPaths(path)
  for (const parentPath of parentPaths) {
    if (
      await checkPathPermissions(
        checkPermCb,
        entityWhoAsk,
        permitForEntity,
        parentPath,
        action
      )
    ) {
      return true
    }
  }

  return false
}

/**
 * Проверяет права на конкретный путь (включая fallback для чтения)
 * @param path - путь для проверки
 * @param action - действие (read/write)
 * @returns true если есть права на указанный путь
 */
async function checkPathPermissions(
  checkPermCb: CheckPermCb,
  entityWhoAsk: string,
  permitForEntity: string,
  path: string,
  action: string
): Promise<boolean> {
  // Проверяем основное право на действие
  if (
    await hasPermission(
      checkPermCb,
      entityWhoAsk,
      permitForEntity,
      path,
      action
    )
  ) {
    return true
  }

  // Для операций чтения проверяем право на запись как fallback
  if (
    action === FILE_ACTION.read &&
    (await hasPermission(
      checkPermCb,
      entityWhoAsk,
      permitForEntity,
      path,
      FILE_ACTION.write
    ))
  ) {
    return true
  }

  return false
}

/**
 * Проверяет наличие конкретного права на путь
 * @param path - путь для проверки
 * @param action - действие (read/write)
 * @returns true если право есть
 */
async function hasPermission(
  checkPermCb: CheckPermCb,
  entityWhoAsk: string,
  permitForEntity: string,
  path: string,
  action: string
): Promise<boolean> {
  return await checkPermCb(
    entityWhoAsk,
    permitForEntity,
    action + FILE_PERM_DELIMITER + path
  )
}

/**
 * Генерирует список родительских путей от указанного пути до корня
 * @param path - исходный путь
 * @returns массив родительских путей в порядке от ближайшего к корню
 */
function getParentPaths(path: string): string[] {
  const parentPaths: string[] = []
  let currentPath = path

  // Убираем завершающий слеш если есть (кроме корня)
  if (currentPath !== '/' && currentPath.endsWith('/')) {
    currentPath = currentPath.slice(0, -1)
  }

  // Получаем родительские пути
  while (currentPath !== '/' && currentPath !== '') {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
    if (parentPath === '') {
      parentPaths.push('/')
      break
    }
    parentPaths.push(parentPath)
    currentPath = parentPath
  }

  return parentPaths
}
