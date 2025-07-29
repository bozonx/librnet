module.exports = {
  // Основные настройки форматирования
  printWidth: 80, // Maximum line length
  tabWidth: 2, // Number of spaces per indentation level
  useTabs: false, // Use spaces instead of tabs
  semi: false, // Add semicolons at the end of statements
  singleQuote: true, // Use single quotes instead of double quotes
  quoteProps: 'as-needed', // Quote object properties only when necessary
  trailingComma: 'es5', // Add trailing commas where valid in ES5 (objects, arrays)
  bracketSpacing: true, // Add spaces between brackets in object literals
  bracketSameLine: false, // Put closing > of HTML/JSX on a new line
  arrowParens: 'always', // Always include parentheses around arrow function arguments

  // Конфигурация сортировки импортов
  importOrder: [
    // Внешние импорты из node_modules (третьи стороны)
    '^[a-zA-Z]',
    // Локальные импорты (относительные пути и алиасы)
    '^[@./]',
  ],
  importOrderSeparation: true, // Добавлять пустую строку между группами импортов
  importOrderSortSpecifiers: true, // Сортировать именованные импорты внутри каждого импорта
}
