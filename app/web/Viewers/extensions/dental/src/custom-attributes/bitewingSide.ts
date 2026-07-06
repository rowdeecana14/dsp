export default function bitewingSide(displaySet: Record<string, unknown>): string {
  const description = String(
    displaySet?.SeriesDescription ?? displaySet?.seriesDescription ?? ''
  ).toLowerCase();

  if (/left|\bl\b|bw.?l/.test(description)) {
    return 'left';
  }
  if (/right|\br\b|bw.?r/.test(description)) {
    return 'right';
  }

  const seriesNumber = Number(displaySet?.SeriesNumber ?? displaySet?.seriesNumber ?? 0);
  return seriesNumber % 2 === 0 ? 'right' : 'left';
}
