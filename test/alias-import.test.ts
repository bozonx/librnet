// Тест для проверки импорта с алиасом @
import { RootDirs } from '@/types/Dirs'

describe('Alias @ import test', () => {
  it('should import from @ alias successfully', () => {
    expect(RootDirs).toBeDefined()
    expect(RootDirs.local).toBe('local')
    expect(RootDirs.synced).toBe('synced')
    expect(RootDirs.mnt).toBe('mnt')
  })
})
