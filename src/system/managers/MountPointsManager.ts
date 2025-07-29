import type { System } from '../System'
import type { MountPoint } from '@/types/types'

const SYSTEM_MOUNT_POINT_CFG_NAME = 'system.mountPoints'

export class MountPointsManager {
  private mountPoints: MountPoint[] = []

  constructor(
    private readonly system: System,
    readonly rootDir: string
  ) {}

  async init() {
    this.mountPoints =
      (
        await this.system.configs.loadEntityConfig(
          SYSTEM_MOUNT_POINT_CFG_NAME,
          false
        )
      )?.items || []
  }

  public getMountPoints(): MountPoint[] {
    return structuredClone(this.mountPoints)
  }

  public getMountPointBySrcPath(path: string): MountPoint | undefined {
    return structuredClone(
      this.mountPoints.find((point) => point.src.path === path)
    )
  }

  public getMountPointByDestPath(path: string): MountPoint | undefined {
    return structuredClone(
      this.mountPoints.find((point) => point.dest.path === path)
    )
  }

  public async registerMountPoint(point: MountPoint) {
    if (point.src.type === 'root' && point.dest.type === 'root') {
      throw new Error(
        `Root mount point cannot be both source and destination. ${JSON.stringify(
          point
        )}`
      )
    }

    if (
      this.mountPoints.find(
        (p) => p.src.path === point.src.path && p.dest.path === point.dest.path
      )
    ) {
      throw new Error(`Mount point already exists: ${JSON.stringify(point)}`)
    }

    // Проверка на зацикливание точек монтирования
    this.checkForCircularMountPoints(point)

    this.mountPoints.push(point)

    await this.system.configs.saveEntityConfig(
      SYSTEM_MOUNT_POINT_CFG_NAME,
      { items: this.mountPoints },
      false
    )
  }

  /**
   * Проверяет, не создает ли новая точка монтирования цикл с существующими точками
   * @param newPoint - новая точка монтирования для проверки
   * @throws Error если обнаружен цикл
   */
  private checkForCircularMountPoints(newPoint: MountPoint): void {
    // Создаем временный массив с новой точкой для проверки
    const tempMountPoints = [...this.mountPoints, newPoint]

    // Строим граф зависимостей между точками монтирования
    const graph = new Map<string, string[]>()

    // Инициализируем граф
    for (const point of tempMountPoints) {
      const srcKey = `${point.src.type}:${point.src.path}`
      const destKey = `${point.dest.type}:${point.dest.path}`

      if (!graph.has(srcKey)) {
        graph.set(srcKey, [])
      }
      if (!graph.has(destKey)) {
        graph.set(destKey, [])
      }

      // Добавляем связь: src -> dest
      graph.get(srcKey)!.push(destKey)
    }

    // Проверяем наличие циклов с помощью DFS
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (this.hasCycleDFS(node, graph, visited, recursionStack)) {
          throw new Error(
            `Circular mount point detected. The new mount point would create a cycle: ${JSON.stringify(
              newPoint
            )}`
          )
        }
      }
    }
  }

  /**
   * Рекурсивно проверяет наличие циклов в графе с помощью DFS
   * @param node - текущий узел для проверки
   * @param graph - граф зависимостей
   * @param visited - множество посещенных узлов
   * @param recursionStack - стек рекурсии для обнаружения циклов
   * @returns true если найден цикл, false иначе
   */
  private hasCycleDFS(
    node: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>
  ): boolean {
    // Если узел уже в стеке рекурсии, значит найден цикл
    if (recursionStack.has(node)) {
      return true
    }

    // Если узел уже посещен, циклов нет
    if (visited.has(node)) {
      return false
    }

    // Добавляем узел в стек рекурсии и отмечаем как посещенный
    recursionStack.add(node)
    visited.add(node)

    // Проверяем всех соседей
    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (this.hasCycleDFS(neighbor, graph, visited, recursionStack)) {
        return true
      }
    }

    // Убираем узел из стека рекурсии
    recursionStack.delete(node)

    return false
  }

  /**
   * Проверяет существующие точки монтирования на наличие циклов
   * @returns true если найден цикл, false иначе
   */
  public hasCircularMountPoints(): boolean {
    if (this.mountPoints.length === 0) {
      return false
    }

    // Строим граф зависимостей между точками монтирования
    const graph = new Map<string, string[]>()

    // Инициализируем граф
    for (const point of this.mountPoints) {
      const srcKey = `${point.src.type}:${point.src.path}`
      const destKey = `${point.dest.type}:${point.dest.path}`

      if (!graph.has(srcKey)) {
        graph.set(srcKey, [])
      }
      if (!graph.has(destKey)) {
        graph.set(destKey, [])
      }

      // Добавляем связь: src -> dest
      graph.get(srcKey)!.push(destKey)
    }

    // Проверяем наличие циклов с помощью DFS
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (this.hasCycleDFS(node, graph, visited, recursionStack)) {
          return true
        }
      }
    }

    return false
  }

  public async unregisterMountPointBySrcPath(path: string) {
    this.mountPoints = this.mountPoints.filter((p) => p.src.path !== path)

    await this.system.configs.saveEntityConfig(
      SYSTEM_MOUNT_POINT_CFG_NAME,
      { items: this.mountPoints },
      false
    )
  }

  public async unregisterMountPointByDestPath(path: string) {
    this.mountPoints = this.mountPoints.filter((p) => p.dest.path !== path)

    await this.system.configs.saveEntityConfig(
      SYSTEM_MOUNT_POINT_CFG_NAME,
      { items: this.mountPoints },
      false
    )
  }
}
