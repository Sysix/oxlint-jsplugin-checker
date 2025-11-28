import { execSync } from 'node:child_process';
import fs from 'node:fs';

const reservedPluginNames = new Set([
  'jsdoc',
]);

export const executeJsPlugin = (pluginName: string, ruleName: string, jsPlugin: string): string => {
  const configFile = `plugin-${pluginName}-rule-${pluginName}/${ruleName}`
    .replaceAll('@', '_')
    .replaceAll(/\//g, '_') + '.json'

  const config = {
    plugins: [],
    categories: {
      correctness: 'off',
    },
    jsPlugins: [jsPlugin],
    rules: {
      // Our `testfile.ts` can have code which causes the lint rule to fail sometimes,
      // and that's fine. We just want to make sure we don't get an error.
      [`${pluginName}/${ruleName}`]: 'warn',
    },
  };


  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  let oxlintOutput: string;

  const cliArguments = [
    `--config="${configFile}"`,
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


  fs.unlinkSync(configFile);

  return oxlintOutput;
};

export const getPluginName = (packageName:string) => packageName.startsWith('@')
  ? packageName.split('/', 1)[0]
  : packageName.replace('eslint-plugin-', '');
