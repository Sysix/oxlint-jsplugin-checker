import { executeJsPlugin, getPluginName } from './helper';

const isQuiet = process.argv.includes('--quiet');


// NOTE: jsdoc will always fail due to being the same name as a built-in plugin.

// Uncomment plugins here to test them.
const pluginsToTest = [
  ...[
    'eslint-plugin-perfectionist',
    'eslint-plugin-header',
    'eslint-plugin-tsdoc',
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
    'eslint-plugin-fp',
    'eslint-plugin-better-tailwindcss',
  ].map(packageName => ({packageName, jsPlugin: packageName, isReserved: false})),
  // Reserved plugin names
  ...[
    'eslint-plugin-jsdoc',
    'eslint-plugin-unicorn',
  ].map(packageName => ({packageName, jsPlugin: `../${packageName}.mjs`, isReserved: true})),
];

let successfulRulesCounter = 0;
let failedRulesCounter = 0;
let fullySuccessfulPlugins = [];

for (const {packageName, jsPlugin, isReserved} of pluginsToTest) {
  const {default: plugin} = await import(jsPlugin);

  let pluginNameToDisplay;
  let pluginNameToRun;
  if (isReserved) {
    pluginNameToDisplay = getPluginName(packageName);
    pluginNameToRun = getPluginName(plugin.meta.name);
  } else {
    pluginNameToDisplay = getPluginName(plugin.meta?.name ?? packageName);
    pluginNameToRun = pluginNameToDisplay;
  }

  console.log(`\n=== Checking plugin: ${packageName} ===\n`);

  let currentPluginHasAnyFailures = false;
  for (const ruleName of Object.keys(plugin.rules)) {
    const rule = `${pluginNameToDisplay}/${ruleName}`;
    const output = executeJsPlugin(pluginNameToRun, ruleName, jsPlugin.replace('../', './'));

    /// We are fine with warnings (they mean the rule failed but did not hit an error/crash), so allow them.
    if (/Found \d+ warnings? and 0 errors/.test(output.trimStart())) {
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
    fullySuccessfulPlugins.push(packageName);
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
