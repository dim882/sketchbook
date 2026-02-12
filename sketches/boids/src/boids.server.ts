import type { SketchServerHandler, SketchParams } from '../../../tools/src/lib/types';

interface FlockParams extends SketchParams {
  separationDist: number;
  alignDist: number;
  cohesionDist: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

function getParams(fileContent: string): FlockParams {
  // Extract FLOCK_PARAMS from the file content
  const match = fileContent.match(/export const FLOCK_PARAMS[^}]+}/s);
  if (!match) {
    throw new Error('Could not parse parameters from file');
  }

  const paramsText = match[0];

  // Extract individual values using regex
  const extractNumber = (text: string, paramName: string): number => {
    const regex = new RegExp(`${paramName}:\\s*(\\d+(?:\\.\\d+)?)`);
    const match = text.match(regex);
    if (!match) throw new Error(`Could not find ${paramName}`);
    return parseFloat(match[1]);
  };

  return {
    separationDist: extractNumber(paramsText, 'separationDist'),
    alignDist: extractNumber(paramsText, 'alignDist'),
    cohesionDist: extractNumber(paramsText, 'cohesionDist'),
    separationWeight: extractNumber(paramsText, 'separationWeight'),
    alignmentWeight: extractNumber(paramsText, 'alignmentWeight'),
    cohesionWeight: extractNumber(paramsText, 'cohesionWeight'),
  };
}

const handler: SketchServerHandler = {
  getParams,
};

export default handler;
