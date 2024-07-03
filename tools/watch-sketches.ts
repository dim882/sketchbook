import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const sketchesDir = path.join(__dirname, '../', 'sketches');
const dirs = fs.readdirSync(sketchesDir);
type Command = { command: string; name: string };

const commands: Command[] = dirs
  .map((dir) => {
    const packageJsonPath = path.join(sketchesDir, dir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = require(packageJsonPath);

      if (packageJson.scripts && packageJson.scripts.watch) {
        return {
          command: `yarn workspace ${packageJson.name} watch`,
          name: packageJson.name,
        };
      }
    }

    return null;
  })
  .filter((command) => command !== null);

if (commands.length) {
  const processes = commands.map(({ command, name }) => {
    const [cmd, ...args] = command.split(' ');

    const child = spawn(cmd, args, { stdio: 'inherit' });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`Command "${command}" from ${name} failed with code ${code}`);
      }
    });

    return child;
  });

  Promise.all(processes.map((p) => new Promise((resolve) => p.on('close', resolve))))
    .then(() => {
      console.log('All commands completed successfully');
    })
    .catch((error) => {
      console.error('Some commands failed:', error);
    });
} else {
  console.log('No watch scripts found to run.');
}
