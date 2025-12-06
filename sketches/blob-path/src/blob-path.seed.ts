import { PseudoRandomNumberGenerator } from './blob-path';
import prng from './pnrg';

const QUERY_STRING_SEED = 'seed';

const getSeedFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get(QUERY_STRING_SEED) || '';
};

const generateRandomSeed = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

const setSeedInUrl = (seed: string): void => {
  const url = new URL(window.location.href);

  url.searchParams.set(QUERY_STRING_SEED, seed);
  window.history.replaceState({}, '', url.toString());
};

const ensureSeedInUrl = (): string => {
  const existingSeed = getSeedFromUrl();

  if (existingSeed) {
    return existingSeed;
  }

  const newSeed = generateRandomSeed();

  setSeedInUrl(newSeed);

  return newSeed;
};

export const createSeedState = () => {
  let currentSeed = ensureSeedInUrl();
  let currentPrng = prng(currentSeed);

  function createNewPrng() {
    const newSeed = generateRandomSeed();

    currentSeed = newSeed;
    currentPrng = prng(newSeed);
    setSeedInUrl(newSeed);

    return currentPrng;
  }

  return {
    prng: currentPrng,
    seed: currentSeed,
    changeSeed: createNewPrng,
    handleSeedChange: (callback: (rand: PseudoRandomNumberGenerator) => void) => {
      return () => {
        callback(createNewPrng());
      };
    },
  };
};
