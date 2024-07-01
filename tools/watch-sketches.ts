import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const sketchesDir = path.join(__dirname, '../', 'sketches');
const dirs = fs.readdirSync(sketchesDir);

const commands = dirs
  .map((dir) => {
    const packageJsonPath = path.join(sketchesDir, dir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);

      if (packageJson.scripts && packageJson.scripts.watch) {
        return `yarn workspace ${packageJson.name} watch`;
      }
    }

    return null;
  })
  .filter(Boolean);

if (commands.length) {
  const concurrentCommand = `npx concurrently "${commands.join('" "')}"`;
  console.log('Running:', concurrentCommand);

  exec(concurrentCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
} else {
  console.log('No watch scripts found to run.');
}
