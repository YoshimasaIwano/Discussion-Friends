export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('Empty array');
  }

  const sum = numbers.reduce((acc, current) => acc + current, 0);
  const avg = sum / numbers.length;
  return avg;
}

export function sum(numbers: number[]): number {
  return numbers.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
}
