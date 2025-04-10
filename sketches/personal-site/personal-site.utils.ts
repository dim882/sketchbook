import { colors } from './colors';

export function createColorPalettes(colorData: typeof colors): Record<string, string[]> {
  return Object.entries(colorData).reduce((acc, [colorName, shades]) => {
    const colorArray = Object.keys(shades)
      .sort()
      .map((key) => shades[key].value);

    acc[colorName] = colorArray;

    return acc;
  }, {} as Record<string, string[]>);
}
