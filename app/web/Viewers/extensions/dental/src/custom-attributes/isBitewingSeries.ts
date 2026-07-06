export default function isBitewingSeries(displaySet: Record<string, unknown>): boolean {
  const description = String(
    displaySet?.SeriesDescription ?? displaySet?.seriesDescription ?? ''
  ).toLowerCase();
  return /bitewing|\bbw\b|bite.?wing/.test(description);
}
