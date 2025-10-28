import { execSync } from 'node:child_process';
import fs from 'node:fs';

const executeOxlintWithConfiguration = (
  filename: string,
  config: {
    jsPlugin?: string[];
    categories?: Record<string, unknown>;
    rules?: Record<string, unknown>;
  }
) => {
  fs.writeFileSync(filename, JSON.stringify(config));
  let oxlintOutput: string;

  const cliArguments = [
    `--config="${filename}"`,
    'testfile.ts',
  ];

  try {
    oxlintOutput = execSync(`npx oxlint ${cliArguments.join(' ')}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

  } catch (error: any) {
    oxlintOutput = error.stdout || error.message;
  }


  fs.unlinkSync(filename);

  return oxlintOutput;
};

export const executeJsPlugin = (rule: string, pluginName: string): string => {
  const config = {
    plugins: [],
    categories: {
      correctness: 'off',
    },
    jsPlugins: [pluginName],
    rules: {
      [rule]: 'error',
    },
  };

  const filename = `plugin-${pluginName}-rule-${rule}.json`
    .replaceAll('@', '_')
    .replaceAll(/\//g, '_');
  return executeOxlintWithConfiguration(filename, config);
};