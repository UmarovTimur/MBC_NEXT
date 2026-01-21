export function leadingZero(num: number, size = 2): string {
  let s = num.toString();
  while (s.length < size) s = "0" + s;
  return s;
}
