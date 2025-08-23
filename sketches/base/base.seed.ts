import prng from './pnrg';

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

export const createSeedState = () => {
  const initialSeed = ensureSeedInUrl();
  let currentSeed = initialSeed;
  let currentRand = prng(initialSeed);

  return {
    getRand: () => currentRand,
    getSeed: () => currentSeed,
    changeSeed: (newSeed: string) => {
      setSeedInUrl(newSeed);
      currentSeed = newSeed;
      currentRand = prng(newSeed);
      return currentRand;
    },
  };
};

export const handleSeedChange = (
  context: CanvasRenderingContext2D | null,
  seedState: ReturnType<typeof createSeedState>,
  render: (context: CanvasRenderingContext2D, rand: () => number) => void
) => {
  return () => {
    const newRand = seedState.changeSeed(generateRandomSeed());

    if (context) {
      render(context, newRand);
    }
  };
};
