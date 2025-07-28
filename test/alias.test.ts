// Тестируем импорт с алиасом @ - используем простой файл без зависимостей
import { RootDirs, LocalDataSubDirs } from '@/types/Dirs'

describe('Alias @ test', () => {
  it('should import from @ alias', () => {
    expect(RootDirs).toBeDefined()
    expect(LocalDataSubDirs).toBeDefined()
    expect(RootDirs.local).toBe('local')
    expect(LocalDataSubDirs.system).toBe('system')
  })
})
