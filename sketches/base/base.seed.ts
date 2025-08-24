import { PseudoRandomNumberGenerator } from './base';
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

  function createNewPrng() {
    const newSeed = generateRandomSeed();

    currentSeed = newSeed;
    currentRand = prng(newSeed);
    setSeedInUrl(newSeed);

    return currentRand;
  }

  return {
    getRand: () => currentRand,
    getSeed: () => currentSeed,
    changeSeed: createNewPrng,
    handleSeedChange: (callback: (rand: PseudoRandomNumberGenerator) => void) => {
      return () => {
        callback(createNewPrng());
      };
    },
  };
};
