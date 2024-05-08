const getSketchName = R.propPath(['params', 'sketchName']);

const computeDistPath = (sketchName) => path.join(__dirname, '../sketches', sketchName, 'dist');

module.exports = {
  getSketchName,
  computeDistPath,
};
