
import stylistic from '@stylistic/eslint-plugin';
// import header from 'eslint-plugin-header';
// import jsdoc from 'eslint-plugin-jsdoc';
// import mocha from 'eslint-plugin-mocha';
import perfectionist from 'eslint-plugin-perfectionist';
// import regexp from 'eslint-plugin-regexp';
// import tsdoc from 'eslint-plugin-tsdoc';
import { executeJsPlugin } from './helper';

const setup = [
  {
    pluginName: 'eslint-plugin-perfectionist',
    rules: Object.keys(perfectionist.rules),
  },
  // {
  //   pluginName: 'eslint-plugin-header',
  //   rules: Object.keys(header.rules),
  // },
  // {
  //   pluginName: 'eslint-plugin-tsdoc',
  //   rules: Object.keys(tsdoc.rules),
  // },
  // {
  //   pluginName: 'eslint-plugin-jsdoc',
  //   rules: Object.keys(jsdoc.rules || {}),
  // },
  // {
  //   pluginName: 'eslint-plugin-mocha',
  //   rules: Object.keys(mocha.rules || {}),
  // },
  {
    pluginName: '@stylistic/eslint-plugin',
    rules: Object.keys(stylistic.rules || {}),
  },
  // {
  //   pluginName: 'eslint-plugin-regexp',
  //   rules: Object.keys(regexp.rules || {}),
  // },
];

for (const { pluginName, rules } of setup) {
  console.log(`\n=== Checking plugin: ${pluginName} ===\n`);
  for (const ruleName of rules) {
    const ruleSuffix = pluginName.startsWith('@')
    ? pluginName.split('/', 1)[0]
    : pluginName.replace('eslint-plugin-', '');
    const rule = `${ruleSuffix}/${ruleName}`;
    const output = executeJsPlugin(rule, pluginName);
    if (output.trimStart().startsWith('Found 0 warnings and 0 errors')) {
      console.log(`✔️ Rule "${rule}"`);
      continue;
    }

    console.log(`⚠ Output for rule "${rule}":\n${output}\n\n`);
  }
}