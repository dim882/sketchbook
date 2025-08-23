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

// Utility functions for random number generation
export const getFloat = (generateNumber: () => number, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: () => number, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};

// Functional state management
export const createSeedState = (initialSeed: string, prngFn: (seed: string) => () => number) => {
  let currentRand = prngFn(initialSeed);

  return {
    getRand: () => currentRand,
    changeSeed: (newSeed: string) => {
      setSeedInUrl(newSeed);
      currentRand = prngFn(newSeed);
      return currentRand;
    },
  };
};

// Standalone event handler function
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
