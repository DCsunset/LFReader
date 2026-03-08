// Parse number (with integer check)
export function parseNumber(value: string, int = false) {
  if (value.length === 0) {
    return
  }

  const num = parseFloat(value);

  if (Number.isNaN(num) || (int && Number.isSafeInteger(num))) {
    return
  }
  return num
}

