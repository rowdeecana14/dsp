type DisplaySet = Record<string, unknown> & {
  Modality?: string;
  modality?: string;
  displaySetInstanceUID?: string;
  instances?: Array<{ Modality?: string }>;
};

type MatchOptions = {
  displaySetMatchDetails?: Map<
    string,
    { displaySetInstanceUID?: string }
  >;
  allDisplaySets?: DisplaySet[];
  displaySets?: DisplaySet[];
};

function getModality(displaySet: DisplaySet | undefined): string | undefined {
  if (!displaySet) {
    return undefined;
  }
  return (
    displaySet.Modality ??
    displaySet.modality ??
    displaySet.instances?.[0]?.Modality
  );
}

/**
 * Series-level HP attribute: true when candidate series shares Modality with
 * the matched current (top-left) display set.
 */
export default function sameModalityAsCurrent(
  displaySet: DisplaySet,
  options?: MatchOptions
): boolean {
  const currentMatch = options?.displaySetMatchDetails?.get('currentDisplaySetId');
  if (!currentMatch?.displaySetInstanceUID) {
    return true;
  }

  const pool = options?.allDisplaySets ?? options?.displaySets ?? [];
  const currentSet = pool.find(
    ds => ds.displaySetInstanceUID === currentMatch.displaySetInstanceUID
  );

  const currentModality = getModality(currentSet);
  const candidateModality = getModality(displaySet);

  if (!currentModality || !candidateModality) {
    return true;
  }

  return currentModality === candidateModality;
}
