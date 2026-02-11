import { IFlockParams } from './boid-fuzz.params';
import type { SketchServerHandler } from '../../../tools/src/lib/types';

export interface IAllParams extends IFlockParams, Record<string, unknown> {
  BOID_COUNT: number;
  WOIM_LENGTH: number;
  BACKGROUND_COLOR: string;
}

function getParamsFromTS(fileContent: string): IAllParams {
  const match = fileContent.match(/export const FLOCK_PARAMS[^}]+}/s);

  if (!match) {
    throw new Error('Could not parse parameters from file');
  }

  const paramsText = match[0];

  const extractNumber = (text: string, paramName: string): number => {
    // Handle both "paramName: value" (in objects) and "paramName = value" (in const declarations)
    const regex = new RegExp(`${paramName}\\s*[:=]\\s*(\\d+(?:\\.\\d+)?)`);
    const match = text.match(regex);

    if (!match) throw new Error(`Could not find ${paramName}`);

    return parseFloat(match[1]);
  };

  const extractString = (text: string, paramName: string): string => {
    const regex = new RegExp(`${paramName}\\s*=\\s*['"]([^'"]+)['"]`);
    const match = text.match(regex);

    if (!match) throw new Error(`Could not find ${paramName}`);

    return match[1];
  };

  return {
    separationDist: extractNumber(paramsText, 'separationDist'),
    alignDist: extractNumber(paramsText, 'alignDist'),
    cohesionDist: extractNumber(paramsText, 'cohesionDist'),
    separationWeight: extractNumber(paramsText, 'separationWeight'),
    alignmentWeight: extractNumber(paramsText, 'alignmentWeight'),
    cohesionWeight: extractNumber(paramsText, 'cohesionWeight'),
    BOID_COUNT: extractNumber(fileContent, 'BOID_COUNT'),
    WOIM_LENGTH: extractNumber(fileContent, 'WOIM_LENGTH'),
    BACKGROUND_COLOR: extractString(fileContent, 'BACKGROUND_COLOR'),
  };
}

const handler: SketchServerHandler = {
  getParams: getParamsFromTS,
};

export default handler;
