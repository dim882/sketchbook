export const getFloat = (generateNumber: () => number, lower = 0, upper = 1) => {
  return (upper - lower) * generateNumber() + lower;
};

export const getInteger = (generateNumber: () => number, lower = 0, upper = 1) => {
  return Math.floor(getFloat(generateNumber, lower, upper));
};
