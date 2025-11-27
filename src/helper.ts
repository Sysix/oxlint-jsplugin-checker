import { execSync } from 'node:child_process';
import fs from 'node:fs';

const reservedPluginNames = new Set([
  'jsdoc',
]);

export const executeJsPlugin = (ruleSuffix: string, ruleName: string, pluginName: string): string => {
  const isReservedPlugin = reservedPluginNames.has(ruleSuffix);

  const filenameBase = `plugin-${pluginName}-rule-${ruleSuffix}_${ruleName}`
    .replaceAll('@', '_')
    .replaceAll(/\//g, '_');
  const configFile = `${filenameBase}.json`;

  let pluginFile;
  let jsPlugin = pluginName;
  if (isReservedPlugin) {
    ruleSuffix = `reserved-${ruleSuffix}`;
    pluginFile = `${filenameBase}.mjs`;
    jsPlugin = `./${pluginFile}`

    fs.writeFileSync(pluginFile, `
      import plugin from '${pluginName}';

      export default {
        ...plugin,
        meta: {
          ...plugin.meta,
          name: 'eslint-plugin-${ruleSuffix}',
        },
      };
    `);
  }

  const config = {
    plugins: [],
    categories: {
      correctness: 'off',
    },
    jsPlugins: [jsPlugin],
    rules: {
      // Our `testfile.ts` can have code which causes the lint rule to fail sometimes,
      // and that's fine. We just want to make sure we don't get an error.
      [`${ruleSuffix}/${ruleName}`]: 'warn',
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
  if (pluginFile) {
    fs.unlinkSync(pluginFile)
  }

  return oxlintOutput;
};

export const getPluginName = (packageName:string) => packageName.startsWith('@')
  ? packageName.split('/', 1)[0]
  : packageName.replace('eslint-plugin-', '');
