// Простые математические функции для демонстрации покрытия кода

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}

export function power(base: number, exponent: number): number {
  if (exponent === 0) {
    return 1;
  }
  if (exponent < 0) {
    return 1 / power(base, -exponent);
  }
  return base * power(base, exponent - 1);
}
