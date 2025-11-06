import stylistic from '@stylistic/eslint-plugin';
// @ts-expect-error: No types available
import header from 'eslint-plugin-header';
import jsdoc from 'eslint-plugin-jsdoc';
import mocha from 'eslint-plugin-mocha';
import perfectionist from 'eslint-plugin-perfectionist';
import regexp from 'eslint-plugin-regexp';
import tsdoc from 'eslint-plugin-tsdoc';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import storybook from 'eslint-plugin-storybook';
// @ts-expect-error: No types available
import noJquery from 'eslint-plugin-no-jquery';
import graphqlEslint from '@graphql-eslint/eslint-plugin';
import docusaurus from '@docusaurus/eslint-plugin';
// @ts-expect-error: No types available
import importAlias from 'eslint-plugin-import-alias';
import angularEslint from '@angular-eslint/eslint-plugin';
import formatjs from 'eslint-plugin-formatjs';
import cypress from 'eslint-plugin-cypress';
import playwright from 'eslint-plugin-playwright';
import solid from 'eslint-plugin-solid';
import compat from 'eslint-plugin-compat';
// @ts-expect-error: No types available
import fp from 'eslint-plugin-fp';
import { executeJsPlugin } from './helper';

const isQuiet = process.argv.includes('--quiet');

const setup = [
  {
    pluginName: 'eslint-plugin-perfectionist',
    rules: Object.keys(perfectionist.rules),
  },
  {
    pluginName: 'eslint-plugin-header',
    rules: Object.keys(header.rules),
  },
  {
    pluginName: 'eslint-plugin-tsdoc',
    rules: Object.keys(tsdoc.rules),
  },
  {
    pluginName: 'eslint-plugin-jsdoc',
    rules: Object.keys(jsdoc.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-mocha',
    rules: Object.keys(mocha.rules || {}),
  },
  {
    pluginName: '@stylistic/eslint-plugin',
    rules: Object.keys(stylistic.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-testing-library',
    rules: Object.keys(testingLibrary.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-jest-dom',
    rules: Object.keys(jestDom.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-storybook',
    rules: Object.keys(storybook.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-regexp',
    rules: Object.keys(regexp.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-no-jquery',
    rules: Object.keys(noJquery.rules || {}),
  },
  {
    pluginName: '@graphql-eslint/eslint-plugin',
    rules: Object.keys(graphqlEslint.rules || {}),
  },
  {
    pluginName: '@docusaurus/eslint-plugin',
    rules: Object.keys(docusaurus.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-import-alias',
    rules: Object.keys(importAlias.rules || {}),
  },
  {
    pluginName: '@angular-eslint/eslint-plugin',
    rules: Object.keys(angularEslint.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-formatjs',
    // @ts-expect-error: types are incorrect for formatjs.rules
    rules: Object.keys(formatjs.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-cypress',
    rules: Object.keys(cypress.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-playwright',
    rules: Object.keys(playwright.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-solid',
    rules: Object.keys(solid.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-compat',
    rules: Object.keys(compat.rules || {}),
  },
  {
    pluginName: 'eslint-plugin-fp',
    rules: Object.keys(fp.rules || {}),
  },
];

// NOTE: jsdoc will always fail due to being the same name as a built-in plugin.

// Uncomment plugins here to test them.
const pluginsToTest = [
  'eslint-plugin-perfectionist',
  'eslint-plugin-header',
  'eslint-plugin-tsdoc',
  // 'eslint-plugin-jsdoc',
  'eslint-plugin-mocha',
  '@stylistic/eslint-plugin',
  'eslint-plugin-testing-library',
  'eslint-plugin-jest-dom',
  'eslint-plugin-storybook',
  'eslint-plugin-regexp',
  'eslint-plugin-no-jquery',
  '@graphql-eslint/eslint-plugin',
  '@docusaurus/eslint-plugin',
  'eslint-plugin-import-alias',
  '@angular-eslint/eslint-plugin',
  'eslint-plugin-formatjs',
  'eslint-plugin-cypress',
  'eslint-plugin-playwright',
  'eslint-plugin-solid',
  'eslint-plugin-compat',
  'eslint-plugin-fp'
].map(
  (key) => setup.find((s) => s.pluginName === key)!,
);

let successfulRulesCounter = 0;
let failedRulesCounter = 0;
let fullySuccessfulPlugins = [];

for (const { pluginName, rules } of pluginsToTest) {
  console.log(`\n=== Checking plugin: ${pluginName} ===\n`);
  let currentPluginHasAnyFailures = false;
  for (const ruleName of rules) {
    const ruleSuffix = pluginName.startsWith('@')
    ? pluginName.split('/', 1)[0]
    : pluginName.replace('eslint-plugin-', '');
    const rule = `${ruleSuffix}/${ruleName}`;
    const output = executeJsPlugin(rule, pluginName);
    if (output.trimStart().startsWith('Found 0 warnings and 0 errors')) {
      console.log(`✔️ Rule "${rule}"`);
      successfulRulesCounter++;
      continue;
    }

    failedRulesCounter++;

    if (isQuiet) {
      console.log(`❌ Rule "${rule}" produced warnings/errors.`);
    } else {
      console.log(`❌ Output for rule "${rule}":\n${output}\n\n`);
    }
    currentPluginHasAnyFailures = true;
  }

  // If no failures occurred in this plugin, add it to the list of fully successful plugins.
  if (!currentPluginHasAnyFailures) {
    fullySuccessfulPlugins.push(pluginName);
  } 
}

console.log(`\n=== Summary ===\n`);
console.log(`Successful rules: ${successfulRulesCounter}`);
console.log(`Failed rules: ${failedRulesCounter}`);

if (fullySuccessfulPlugins.length > 0) {
  console.log(`\nPlugins with all rules passing:`);
  for (const pluginName of fullySuccessfulPlugins) {
    console.log(`- ${pluginName}`);
  }
}
