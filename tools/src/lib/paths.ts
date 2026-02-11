import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../../..');

const toolsDir = path.resolve(__dirname, '../..');

export const getProjectRoot = () => projectRoot;

export const getSketchesDir = () => path.join(projectRoot, 'sketches');

export const getPublicDir = () => path.join(toolsDir, 'public');

export const getLibDir = () => path.join(projectRoot, 'lib');

export const getToolsDir = () => toolsDir;
