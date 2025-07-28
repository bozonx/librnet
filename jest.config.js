export default {
  // Указываем, что используем ES модули
  preset: 'ts-jest/presets/default-esm',

  // Расширения файлов для тестов
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/src/**/*.test.ts'],

  // Исключаем файлы из тестирования
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/distr/',
    '<rootDir>/_old/',
    '<rootDir>/_testData/',
    '<rootDir>/src/_not_used/',
  ],

  // Настройки для TypeScript
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },

  // Настройки покрытия кода
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    'test/**/*.ts',
    '!src/**/*.d.ts',
    '!src/_not_used/**',
    '!src/**/*.test.ts',
    '!src/**/index.ts',
    '!src/starters/**',
    '!src/compositor/**',
    '!test/**/*.test.ts',
    '!test/setup.ts',
  ],

  // Форматы отчетов о покрытии
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

  // Директория для отчетов о покрытии
  coverageDirectory: 'coverage',

  // Настройки для ES модулей
  extensionsToTreatAsEsm: ['.ts'],

  // Настройки окружения
  testEnvironment: 'node',

  // Таймаут для тестов
  testTimeout: 10000,

  // Настройки для асинхронных тестов
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // Настройки для моков
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Настройки для очистки моков между тестами
  clearMocks: true,
  restoreMocks: true,

  // Настройки для verbose режима
  verbose: true,

  // Настройки для параллельного выполнения тестов
  maxWorkers: '50%',
};
