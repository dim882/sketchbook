export interface IPoint {
  x: number;
  y: number;
  z: number;
}

export interface ILorenzParameters {
  sigma: number;
  rho: number;
  beta: number;
}

export interface IAizawaParameters {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

export interface IRosslerParameters {
  a: number;
  b: number;
  c: number;
}

export interface IThomasParameters {
  b: number;
}

export interface IAttractorParameters {
  lorenz: ILorenzParameters;
  aizawa: IAizawaParameters;
  rossler: IRosslerParameters;
  thomas: IThomasParameters;
}

export type AttractorType = 'lorenz' | 'aizawa' | 'rossler' | 'thomas';

export interface IGenerateAttractorPointsOptions {
  type: AttractorType;
  iterations: number;
  skipIterations: number;
  parameters: IAttractorParameters;
  prng: () => number;
}
