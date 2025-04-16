export type IPalette = Record<string, string[]>;

export function getPalette(): IPalette {
  return Object.entries(colors).reduce((acc, [colorName, shades]) => {
    const colorArray = Object.keys(shades)
      .sort()
      .map((key) => shades[key].value);

    acc[colorName] = colorArray;

    return acc;
  }, {} as Record<string, string[]>);
}

export const colors = {
  red: {
    '100': {
      type: 'color',
      value: '#3d2a29ff',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#633936ff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#8f443dff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#b94f46ff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#c27770ff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#d19994ff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e8ccc9ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f7eeedff',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#1f1514ff',
      blendMode: 'normal',
    },
  },
  blue: {
    '100': {
      type: 'color',
      value: '#454f54ff',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#67777eff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#6c8693ff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#8a9ea8ff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#a6b5bdff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#c7ced1ff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e3e6e8ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f7f8f8ff',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#2e3538ff',
      blendMode: 'normal',
    },
  },
  yellow: {
    '100': {
      type: 'color',
      value: '#585441ff',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#757057ff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#938c6cff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#b2aa80ff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#c2bda3ff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#d4d1c4ff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e9e8e2ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#F4F4F0',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#3b382bff',
      blendMode: 'normal',
    },
  },
  orange: {
    '100': {
      type: 'color',
      value: '#604d39ff',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#8a6642ff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#b98046ff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#d6995cff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#d9b38cff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#e5ccb2ff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e8d9c9ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#faf5f0ff',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#2e261fff',
      blendMode: 'normal',
    },
  },
  violet: {
    '100': {
      type: 'color',
      value: '#5c3d42ff',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#854752ff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#ac5362ff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#c76b7aff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#d1949eff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#debac0ff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#eddee0ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#e8d9c9ff',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#382e30ff',
      blendMode: 'normal',
    },
  },
  indigo: {
    '100': {
      type: 'color',
      value: '#303136ff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#67697eff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#8f90a3ff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#abacbaff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#c7c8d1ff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e3e3e8ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f9f9faff',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#18181bff',
      blendMode: 'normal',
    },
    '00': {
      type: 'color',
      value: '#454654ff',
      blendMode: 'normal',
    },
  },
  green: {
    '100': {
      type: 'color',
      value: '#45544bff',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#5c7064ff',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#8aa896ff',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#a4c3b1ff',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#b6c9beff',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#c7d1cbff',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e3e8e5ff',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f6f8f7ff',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#2e3832ff',
      blendMode: 'normal',
    },
  },
};
