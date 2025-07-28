/// <reference types="jest" />

// Глобальные настройки для Jest тестов

// Увеличиваем таймаут для асинхронных операций
jest.setTimeout(10000);

// Глобальные моки для Node.js модулей
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    ...jest.requireActual('fs').promises,
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    access: jest.fn(),
  },
}));

jest.mock('path', () => ({
  ...jest.requireActual('path'),
  resolve: jest.fn(),
  join: jest.fn(),
  dirname: jest.fn(),
  basename: jest.fn(),
}));

// Очистка после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

// Очистка после всех тестов
afterAll(() => {
  jest.restoreAllMocks();
});
