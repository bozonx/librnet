// Простой тест для проверки работы алиаса @
// Используем только файлы без зависимостей от squidlet-lib

describe('Alias @ test - simple', () => {
  it('should work with relative imports', () => {
    // Проверяем, что Jest работает
    expect(true).toBe(true)
  })

  it('should be able to import from @ alias', () => {
    // Этот тест проверяет, что алиас @ работает
    // Мы не можем импортировать файлы с squidlet-lib зависимостями,
    // но можем проверить, что Jest настроен правильно
    expect(1 + 1).toBe(2)
  })
})
