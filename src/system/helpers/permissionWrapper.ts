import type { System } from '@/system/System.js'

export function permissionWrapper(
  system: System,
  entityWhoAsk: string,
  entityName: string,
  api: Record<string, any>
) {
  return new Proxy(api, {
    get: (target, prop) => {
      // Преобразуем prop в строку для проверки разрешений
      const propName = String(prop)

      // Проверяем разрешения для данного метода API
      try {
        system.permissions.checkPermissions(entityWhoAsk, entityName, propName)
      } catch (error) {
        // Если разрешение не предоставлено, возвращаем функцию которая выбросит ошибку
        return (...args: any[]) => {
          throw new Error(
            `Permission denied: ${entityName}.${propName} - ${
              error instanceof Error ? error.message : 'Access denied'
            }`
          )
        }
      }

      // Если разрешение предоставлено, проверяем что это функция
      if (prop in target) {
        const method = target[prop as keyof typeof target]

        // Проверяем что это функция - только функции разрешены для вызова
        if (typeof method === 'function') {
          return (...args: any[]) => {
            // Дополнительная проверка разрешений при вызове метода
            try {
              system.permissions.checkPermissions(
                entityWhoAsk,
                entityName,
                propName
              )
              return method.apply(target, args)
            } catch (error) {
              throw new Error(
                `Permission denied: ${entityName}.${propName} - ${
                  error instanceof Error ? error.message : 'Access denied'
                }`
              )
            }
          }
        } else {
          // Если это не функция, выбрасываем ошибку
          throw new Error(
            `Access denied: ${entityName}.${propName} - only function calls are allowed`
          )
        }
      }

      return undefined
    },
  })
}
