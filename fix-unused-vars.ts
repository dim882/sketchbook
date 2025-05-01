import * as fs from 'fs';
import * as path from 'path';

// Parse the lint output file
const parseLintOutput = (
  lintOutput: string
): Array<{
  filePath: string;
  issues: Array<{
    line: number;
    column: number;
    message: string;
    rule: string;
  }>;
}> => {
  const files: Record<string, Array<{ line: number; column: number; message: string; rule: string }>> = {};
  let currentFile = '';

  lintOutput.split('\n').forEach((line) => {
    // Match file paths
    const fileMatch = line.match(/^(\/.*\.(ts|tsx|js|jsx))$/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      files[currentFile] = [];
      return;
    }

    // Match lint errors
    const errorMatch = line.match(/^\s*(\d+):(\d+)\s+error\s+(.*?)\s+(@typescript-eslint\/.*)/);
    if (errorMatch && currentFile) {
      files[currentFile].push({
        line: parseInt(errorMatch[1], 10),
        column: parseInt(errorMatch[2], 10),
        message: errorMatch[3],
        rule: errorMatch[4],
      });
    }
  });

  return Object.entries(files).map(([filePath, issues]) => ({ filePath, issues }));
};

// Fix unused variables in a file
const fixUnusedVars = (
  filePath: string,
  issues: Array<{ line: number; column: number; message: string; rule: string }>
) => {
  // Only process no-unused-vars errors
  const unusedVarIssues = issues.filter((issue) => issue.rule === '@typescript-eslint/no-unused-vars');

  if (unusedVarIssues.length === 0) {
    return;
  }

  console.log(`Fixing unused variables in ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Extract variable names from error messages
    const unusedVars = unusedVarIssues
      .map((issue) => {
        const match = issue.message.match(/'([^']+)' is defined but never used/);
        return match
          ? {
              name: match[1],
              line: issue.line - 1, // 0-indexed for array
              column: issue.column - 1, // 0-indexed
            }
          : null;
      })
      .filter(Boolean);

    // Process each line with unused variables
    const lineToVars: Record<number, string[]> = {};

    unusedVars.forEach((varInfo) => {
      if (!varInfo) return;

      if (!lineToVars[varInfo.line]) {
        lineToVars[varInfo.line] = [];
      }
      lineToVars[varInfo.line].push(varInfo.name);
    });

    // Fix each line with unused variables
    Object.entries(lineToVars).forEach(([lineNumStr, varsToRemove]) => {
      const lineNum = parseInt(lineNumStr, 10);
      const line = lines[lineNum];

      // Handle different patterns of variable declarations
      if (line.includes('import')) {
        // Handle import statements
        lines[lineNum] = fixImportStatement(line, varsToRemove);
      } else if (line.match(/\bconst\b|\blet\b|\bvar\b/)) {
        // Handle variable declarations
        lines[lineNum] = fixVariableDeclaration(line, varsToRemove);
      } else if (line.match(/\bfunction\b|\=\>|\bclass\b/)) {
        // Handle function parameters
        lines[lineNum] = fixFunctionParameters(line, varsToRemove);
      }
    });

    // Write the fixed content back to the file
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`✓ Fixed ${unusedVars.length} unused variables in ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error);
  }
};

// Fix import statements by removing unused imports
const fixImportStatement = (line: string, varsToRemove: string[]): string => {
  let newLine = line;

  // Handle named imports like: import { a, b, c } from 'module'
  const namedImportMatch = line.match(/import\s+\{([^}]+)\}\s+from/);
  if (namedImportMatch) {
    const imports = namedImportMatch[1].split(',').map((i) => i.trim());
    const filteredImports = imports.filter((imp) => !varsToRemove.includes(imp));

    if (filteredImports.length === 0) {
      // Remove the entire import if all imports are unused
      return '';
    } else {
      // Replace with filtered imports
      newLine = line.replace(/\{([^}]+)\}/, `{ ${filteredImports.join(', ')} }`);
    }
  }

  // Handle default imports like: import h from 'preact'
  varsToRemove.forEach((varName) => {
    const defaultImportRegex = new RegExp(`import\\s+${varName}\\s+from`);
    if (defaultImportRegex.test(line)) {
      newLine = ''; // Remove the entire line for default imports
    }
  });

  return newLine;
};

// Fix variable declarations by removing unused variables
const fixVariableDeclaration = (line: string, varsToRemove: string[]): string => {
  let newLine = line;

  // Handle destructuring assignments like: const { a, b, c } = obj
  const destructuringMatch = line.match(/\{([^}]+)\}/);
  if (destructuringMatch) {
    const vars = destructuringMatch[1].split(',').map((v) => v.trim());
    const filteredVars = vars.filter((v) => !varsToRemove.includes(v));

    if (filteredVars.length === 0 && line.includes('=')) {
      // If all variables in destructuring are unused, remove the entire declaration
      return '';
    } else if (filteredVars.length > 0) {
      // Replace with filtered variables
      newLine = line.replace(/\{([^}]+)\}/, `{ ${filteredVars.join(', ')} }`);
    }
  }

  // Handle simple variable declarations like: const a = value
  varsToRemove.forEach((varName) => {
    const varDeclarationRegex = new RegExp(`(const|let|var)\\s+${varName}\\s*=`);
    if (varDeclarationRegex.test(line)) {
      newLine = ''; // Remove the entire line for simple declarations
    }
  });

  return newLine;
};

// Fix function parameters by removing unused parameters
const fixFunctionParameters = (line: string, varsToRemove: string[]): string => {
  let newLine = line;

  // Handle function parameters
  const paramMatch = line.match(/\(([^)]*)\)/);
  if (paramMatch) {
    const params = paramMatch[1].split(',').map((p) => p.trim());
    const filteredParams = params.filter((param) => {
      // Extract parameter name (handling typed parameters)
      const paramName = param.split(':')[0].trim();
      return !varsToRemove.includes(paramName);
    });

    newLine = line.replace(/\(([^)]*)\)/, `(${filteredParams.join(', ')})`);
  }

  return newLine;
};

// Main function
const main = () => {
  try {
    const lintOutput = fs.readFileSync('lint.txt', 'utf8');
    const parsedOutput = parseLintOutput(lintOutput);

    // Filter for files with no-unused-vars errors
    const filesWithUnusedVars = parsedOutput.filter((file) =>
      file.issues.some((issue) => issue.rule === '@typescript-eslint/no-unused-vars')
    );

    console.log(`Found ${filesWithUnusedVars.length} files with unused variables`);

    // Fix each file
    filesWithUnusedVars.forEach((file) => {
      fixUnusedVars(file.filePath, file.issues);
    });

    console.log('Completed fixing unused variables');
  } catch (error) {
    console.error('Error processing lint output:', error);
  }
};

main();
