const QUERY_STRING_SEED = 'seed';

export const getSeedFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get(QUERY_STRING_SEED) || '';
};

export const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const setSeedInUrl = (seed: string): void => {
  const url = new URL(window.location.href);

  url.searchParams.set(QUERY_STRING_SEED, seed);
  window.history.replaceState({}, '', url.toString());
};

export const ensureSeedInUrl = (): string => {
  const existingSeed = getSeedFromUrl();

  if (existingSeed) {
    return existingSeed;
  }

  const newSeed = generateRandomSeed();

  setSeedInUrl(newSeed);

  return newSeed;
};
