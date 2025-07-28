# Тестирование

Этот проект использует Jest для тестирования с поддержкой TypeScript и ES модулей.

## Запуск тестов

### Основные команды

```bash
# Запуск всех тестов
npm test

# Запуск тестов в режиме наблюдения
npm run test:watch

# Запуск тестов с подробным выводом
npm run test:verbose

# Запуск тестов с отчетом о покрытии
npm run test:coverage
```

### Конфигурация

- **Jest конфигурация**: `jest.config.js`
- **TypeScript конфигурация для тестов**: `tsconfig.test.json`
- **Настройки тестов**: `test/setup.ts`

## Структура тестов

```
test/
├── setup.ts          # Глобальные настройки Jest
├── jest.d.ts         # Типы Jest
├── core.test.ts      # Основные тесты
└── README.md         # Эта документация
```

## Покрытие кода

Jest настроен для сбора покрытия кода с следующими настройками:

- **Минимальное покрытие**: 70% для всех метрик
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

## Написание тестов

### Пример теста

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { YourClass } from '../src/YourClass';

describe('YourClass', () => {
  let instance: YourClass;

  beforeEach(() => {
    instance = new YourClass();
  });

  it('should work correctly', () => {
    expect(instance.someMethod()).toBe(expectedValue);
  });
});
```

### Глобальные утилиты

В `test/setup.ts` доступны следующие утилиты:

```typescript
// Создание моков
const mock = global.testUtils.createMock<YourType>({ prop: 'value' });

// Ожидание асинхронных операций
await global.testUtils.wait(1000);

// Создание временных данных
const tempData = global.testUtils.createTempData();
```

### Моки

Jest автоматически очищает моки между тестами. Для мокирования модулей используйте:

```typescript
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFile: jest.fn(),
}));
```

## Лучшие практики

1. **Используйте описательные имена тестов**
2. **Группируйте связанные тесты в describe блоки**
3. **Используйте beforeEach для настройки**
4. **Проверяйте как позитивные, так и негативные сценарии**
5. **Используйте моки для изоляции тестов**
6. **Пишите тесты для всех публичных методов**
7. **Поддерживайте высокое покрытие кода**

## Отладка тестов

Для отладки тестов используйте:

```bash
# Запуск конкретного теста
npm test -- --testNamePattern="should work correctly"

# Запуск тестов из конкретного файла
npm test -- test/core.test.ts

# Запуск в режиме отладки
node --inspect-brk node_modules/.bin/jest --runInBand
``` 