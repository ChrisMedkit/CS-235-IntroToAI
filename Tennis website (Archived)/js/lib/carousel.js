// Which slide comes next? Wraps around both ends.
export function nextIndex(i, n, dir) {
  return (i + dir + n) % n;
}
