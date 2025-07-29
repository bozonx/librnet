# Настройка Jest для проекта librnet

## Что было сделано

### 1. Установлены зависимости

Добавлены в `package.json`:

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.2"
  }
}
```

### 2. Создана конфигурация Jest

Файл `jest.config.js`:

- Настроен для работы с TypeScript и ES модулями
- Включено покрытие кода
- Настроены исключения для файлов, которые не нужно тестировать
- Настроены форматы отчетов о покрытии

### 3. Создан отдельный tsconfig для тестов

Файл `tsconfig.test.json`:

- Расширяет основной `tsconfig.json`
- Отключает `verbatimModuleSyntax` для совместимости с Jest
- Включает типы Jest и Node.js

### 4. Настроены глобальные настройки тестов

Файл `test/setup.ts`:

- Увеличен таймаут для асинхронных операций
- Настроены моки для Node.js модулей
- Настроена автоматическая очистка моков

### 5. Добавлены скрипты в package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose"
  }
}
```

## Структура тестов

```
test/
├── setup.ts                    # Глобальные настройки Jest
├── core.test.ts               # Основные тесты
├── coverage-demo.test.ts      # Демонстрация покрытия
├── utils/
│   └── math.ts               # Утилиты для демонстрации
└── README.md                 # Документация по тестированию
```

## Команды для запуска тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:watch

# Запуск тестов с отчетом о покрытии
npm run test:coverage

# Запуск тестов с подробным выводом
npm run test:verbose

# Запуск конкретного теста
npm test -- --testPathPatterns="test/core.test.ts"
```

## Покрытие кода

Jest настроен для сбора покрытия кода с следующими настройками:

- **Минимальное покрытие**: 70% для всех метрик (временно отключено)
- **Форматы отчетов**: text, text-summary, html, lcov
- **Директория отчетов**: `coverage/`

### Исключения из покрытия

Следующие файлы исключены из анализа покрытия:

- `src/**/*.d.ts` - файлы типов
- `src/_not_used/**` - неиспользуемый код
- `src/**/*.test.ts` - тестовые файлы
- `src/**/index.ts` - индексные файлы
- `src/starters/**` - стартовые файлы
- `src/compositor/**` - файлы композитора
- `test/**/*.test.ts` - тестовые файлы
- `test/setup.ts` - настройки тестов

## Особенности конфигурации

### ES модули

Проект использует ES модули, поэтому:

- Используется preset `ts-jest/presets/default-esm`
- Включена опция `useESM: true`
- Настроены `extensionsToTreatAsEsm: ['.ts']`

### TypeScript

- Используется `ts-jest` для трансформации TypeScript
- Настроен отдельный `tsconfig.test.json`
- Отключен `verbatimModuleSyntax` для совместимости

### Моки

- Автоматическая очистка моков между тестами
- Настроены моки для Node.js модулей (fs, path)
- Глобальные настройки в `test/setup.ts`

## Примеры тестов

### Базовый тест

```typescript
import { YourClass } from '../src/YourClass'
import { beforeEach, describe, expect, it } from '@jest/globals'

describe('YourClass', () => {
  let instance: YourClass

  beforeEach(() => {
    instance = new YourClass()
  })

  it('should work correctly', () => {
    expect(instance.someMethod()).toBe(expectedValue)
  })
})
```

### Тест с асинхронными операциями

```typescript
it('should handle async operations', async () => {
  const result = await instance.asyncMethod()
  expect(result).toBe(expectedValue)
})
```

### Тест с моками

```typescript
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFile: jest.fn(),
}))

it('should read file', async () => {
  const mockReadFile = require('fs').readFile
  mockReadFile.mockResolvedValue('file content')

  const result = await instance.readFile('test.txt')
  expect(result).toBe('file content')
})
```

## Решение проблем

### Ошибки TypeScript

Если возникают ошибки TypeScript при запуске тестов:

1. Проверьте `tsconfig.test.json`
2. Убедитесь, что все импорты корректны
3. Проверьте, что типы Jest установлены

### Проблемы с ES модулями

Если есть проблемы с ES модулями:

1. Проверьте настройки `useESM: true`
2. Убедитесь, что используется правильный preset
3. Проверьте `extensionsToTreatAsEsm`

### Проблемы с покрытием

Если покрытие не собирается:

1. Проверьте `collectCoverageFrom`
2. Убедитесь, что файлы не исключены
3. Проверьте, что тесты действительно вызывают код

## Следующие шаги

1. **Исправить ошибки TypeScript** в основном коде проекта
2. **Включить покрытие кода** для основного кода (сейчас отключено из-за ошибок)
3. **Написать тесты** для всех основных компонентов
4. **Настроить CI/CD** для автоматического запуска тестов
5. **Добавить интеграционные тесты** для сложных сценариев

## Полезные ссылки

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Jest CLI Options](https://jestjs.io/docs/cli)
