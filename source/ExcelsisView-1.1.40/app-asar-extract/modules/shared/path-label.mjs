export function middleCut(value, length) {
  const chars = Array.from(value);
  if (chars.length <= length) return value;
  if (length <= 1) return '…';
  const keep = length - 1, left = Math.ceil(keep / 2), right = Math.floor(keep / 2);
  return chars.slice(0, left).join('') + '…' + (right ? chars.slice(-right).join('') : '');
}
export function fitFolderPath(parts, width, measure) {
  const values = parts.slice(-3), lengths = values.map(value => Array.from(value).length);
  let labels = [...values], text = labels.join(' › ');
  while (measure(text) > width) {
    let largest = -1;
    for (let index = 0; index < labels.length; index++) {
      if (lengths[index] <= 1) continue;
      if (largest < 0 || measure(labels[index]) > measure(labels[largest])) largest = index;
    }
    if (largest < 0) break;
    lengths[largest]--;
    labels[largest] = middleCut(values[largest], lengths[largest]);
    text = labels.join(' › ');
  }
  return text;
}
