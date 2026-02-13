export type IPalette = Record<string, string[]>;

export function getPalette(): IPalette {
  return Object.entries(colors).reduce((acc, [colorName, shades]) => {
    const colorArray = Object.keys(shades)
      .sort()
      .reverse()
      .map((key) => shades[key].value);

    acc[colorName] = colorArray;

    return acc;
  }, {} as Record<string, string[]>);
}

export const colors = {
  red: {
    '100': {
      type: 'color',
      value: '#3d2a29',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#633936',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#8f443d',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#b94f46',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#c27770',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#d19994',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e8ccc9',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f7eeed',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#1f1514',
      blendMode: 'normal',
    },
  },
  blue: {
    '100': {
      type: 'color',
      value: '#454f54',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#67777e',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#6c8693',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#8a9ea8',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#a6b5bd',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#c7ced1',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e3e6e8',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f7f8f8',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#2e3538',
      blendMode: 'normal',
    },
  },
  yellow: {
    '100': {
      type: 'color',
      value: '#585441',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#757057',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#938c6c',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#b2aa80',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#c2bda3',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#d4d1c4',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e9e8e2',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#F4F4F0',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#3b382b',
      blendMode: 'normal',
    },
  },
  orange: {
    '100': {
      type: 'color',
      value: '#604d39',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#8a6642',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#b98046',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#d6995c',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#d9b38c',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#e5ccb2',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e8d9c9',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#faf5f0',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#2e261f',
      blendMode: 'normal',
    },
  },
  violet: {
    '100': {
      type: 'color',
      value: '#5c3d42',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#854752',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#ac5362',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#c76b7a',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#d1949e',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#debac0',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#eddee0',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#eFAF5F6',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#382e30',
      blendMode: 'normal',
    },
  },
  indigo: {
    '100': {
      type: 'color',
      value: '#303136',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#67697e',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#8f90a3',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#abacba',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#c7c8d1',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e3e3e8',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f9f9fa',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#18181b',
      blendMode: 'normal',
    },
    '00': {
      type: 'color',
      value: '#454654',
      blendMode: 'normal',
    },
  },
  green: {
    '100': {
      type: 'color',
      value: '#45544b',
      blendMode: 'normal',
    },
    '200': {
      type: 'color',
      value: '#5c7064',
      blendMode: 'normal',
    },
    '300': {
      type: 'color',
      value: '#8aa896',
      blendMode: 'normal',
    },
    '400': {
      type: 'color',
      value: '#a4c3b1',
      blendMode: 'normal',
    },
    '500': {
      type: 'color',
      value: '#b6c9be',
      blendMode: 'normal',
    },
    '600': {
      type: 'color',
      value: '#c7d1cb',
      blendMode: 'normal',
    },
    '700': {
      type: 'color',
      value: '#e3e8e5',
      blendMode: 'normal',
    },
    '800': {
      type: 'color',
      value: '#f6f8f7',
      blendMode: 'normal',
    },
    '000': {
      type: 'color',
      value: '#2e3832',
      blendMode: 'normal',
    },
  },
};

export default colors;
