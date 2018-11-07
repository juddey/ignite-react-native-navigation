// Ignite CLI plugin for ReactNativeNavigation
// ----------------------------------------------------------------------------
const helpers = require('./helpers')
const NPM_MODULE_NAME = 'react-native-navigation'
const NPM_MODULE_VERSION = '2.1.1'
const jetpack = require('fs-jetpack')
const R = require('ramda')
const fixtures = require('./__tests__/package.json.fixture')
const NPM_PACKAGE = process.env.NODE_ENV === 'test'
  ? fixtures.packageJsonWithBowser
  : jetpack.read('package.json', 'json')
const name = NPM_PACKAGE.name
// :point_up: This is kind of dirty from a test perspective as we're relying on
// the tests to be run in the root directory. Better Implementations welcome!
// :point_down: but it kind of works, for now.
const MAIN_APPLICATION_DOT_JAVA = process.env.NODE_ENV === 'test'
  ? jetpack.read('__tests__/MainApplication.fixture.java', 'utf8')
  : jetpack.read(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainApplication.java`, 'utf8')
// In fact, I'm now quite fond of this method! :scream:
let APPDELEGATE_DOT_M = process.env.NODE_ENV === 'test'
  ? jetpack.read('__tests__/AppDelegate.fixture.m', 'utf8')
  : jetpack.read(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.m`, 'utf8')

const PLUGIN_PATH = __dirname
// const APP_PATH = process.cwd()

const add = async function (context) {
  // Learn more about context: https://infinitered.github.io/gluegun/#/context-api.md
  const { ignite, filesystem } = context
  const config = ignite.loadIgniteConfig()
  const functionTemplate = (config) =>  (R.path(['ignite-base-plate', 'format'], config) === 'function') == true

  helpers.updateAndroidFiles(context, name)

  const oldMainApplication = MAIN_APPLICATION_DOT_JAVA
  // run react-native link after we read the old file data as it will generate new faulty imports
  await filesystem.file(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainApplication.old`, { content: oldMainApplication })
  // install an NPM module and link it
  await ignite.addModule(NPM_MODULE_NAME, { link: true, version: NPM_MODULE_VERSION })
  // some substr & substring hackery.
  const ASLIST = 'asList('
  const restOfFile = oldMainApplication.substr(oldMainApplication.indexOf(ASLIST))

  // get the first occuring ); after the asList method declaration.
  const closeIndex = restOfFile.indexOf(');')
  const packages = restOfFile.substring(restOfFile.indexOf(ASLIST) + ASLIST.length + 1, closeIndex)

  const splitPackages = packages.trim()

  // import statements
  const imports = oldMainApplication.match(/^import.*$/gm).join('\n')

  // onCreate
  let onCreate
  if (oldMainApplication.match(/public void onCreate\(\) {[\s\S]*.}/g).length) {
    onCreate = oldMainApplication.match(/public void onCreate\(\) {[\s\S]*.}/g)
  }

  // build new MainApplication.java

  const template = `MainApplication.java.ejs`
  const target = `android/app/src/main/java/com/${name.toLowerCase()}/MainApplication.java`
  const props = {
    packages: splitPackages,
    packageName: name.toLowerCase(),
    imports,
    onCreate
  }

  await context.template.generate({
    template,
    target,
    props,
    directory: `${PLUGIN_PATH}/templates`
  })

  // iOS
  // create a backup of AppDelegate.m
  await filesystem.file(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.old`, { content: APPDELEGATE_DOT_M })

  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^[\s].*RCTRootView.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(new RegExp(`^.*moduleName:@"${name.toLowerCase()}".*(\r\n|\n|\r)`, 'gm'), '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*initialProperties:nil.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*launchOptions:launchOptions];.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*rootView\.backgroundColor = \[\[UIColor alloc\] initWithRed:1\.0f green:1\.0f blue:1\.0f alpha:1\];.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*self\.window = \[\[UIWindow alloc\] initWithFrame:\[UIScreen mainScreen\]\.bounds\];.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*UIViewController \*rootViewController = \[UIViewController new\];.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*rootViewController\.view = rootView;.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*self\.window\.rootViewController = rootViewController;.*(\r\n|\n|\r)/gm, '')
  APPDELEGATE_DOT_M = APPDELEGATE_DOT_M.replace(/^.*\[self\.window makeKeyAndVisible\];\.*(\r\n|\n|\r)/gm, '')

  await filesystem.file(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.m`, { content: APPDELEGATE_DOT_M })

  ignite.patchInFile(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.m`, {
    after: '#import <React/RCTBundleURLProvider.h>',
    insert: '#import <ReactNativeNavigation/ReactNativeNavigation.h>'
  })

  ignite.patchInFile(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.m`, {
    after: 'jsCodeLocation =',
    insert: `  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];`,
    force: true
  })

  if (R.not(R.prop('navigation', config))) {
    // Add filepaths to ignite.json, and write.
    let jsonToWrite = R.merge(config, { navigation: 'react-native-navigation' })
    filesystem.write('./ignite/ignite.json', jsonToWrite, {jsonIndent: 2})
  }

  // Only patch if we're on Bowser, or similar boilerplate.

  if (R.keys(NPM_PACKAGE.devDependencies).includes('ignite-ir-boilerplate-bowser') ||
  R.keys(NPM_PACKAGE.devDependencies).includes('ignite-base-plate')) {
    await context.template.generate({
      template: 'main.js.example.ejs',
      target:  functionTemplate(config) ? `/src/App/main.js` : `/src/app/main.js`,
      props: { name: name.toLowerCase(), navPath: functionTemplate(config) ?  'Navigation' : 'navigation' },
      directory: `${PLUGIN_PATH}/templates`,
      force: true
    })
    await context.template.generate({
      template: 'layouts.js.ejs',
      target: functionTemplate(config) ? `/src/Navigation/layouts.js` : `/src/navigation/layouts.js`,
      props: { name: name.toLowerCase() },
      directory: `${PLUGIN_PATH}/templates`
    })
    await context.template.generate({
      template: 'ScreenRegistry.js.ejs',
      target: functionTemplate(config) ? `/src/Navigation/ScreenRegistry.js` : `/src/navigation/ScreenRegistry.js`,
      props: { name: name.toLowerCase(), location: functionTemplate(config) ? '/App/Components' : '/views/shared/welcome'},
      directory: `${PLUGIN_PATH}/templates`
    })

    await context.template.generate({
      template: 'welcome.js.ejs',
      target: functionTemplate(config) ?  `/src/App/Components/welcome.js` : `/src/views/shared/welcome/welcome.js`,
      props: null,
      directory: `${PLUGIN_PATH}/templates`
    })
  }
}

/**
 * Remove yourself from the project.
 */
const remove = async function (context) {
  // Learn more about context: https://infinitered.github.io/gluegun/#/context-api.md
  const { ignite } = context

  // remove the npm module and unlink it
  await ignite.removeModule(NPM_MODULE_NAME, { unlink: true })

  // Example of removing App/ReactNativeNavigation folder
  // const removeReactNativeNavigation = await context.prompt.confirm(
  //   'Do you want to remove App/ReactNativeNavigation?'
  // )
  // if (removeReactNativeNavigation) { filesystem.remove(`${APP_PATH}/App/ReactNativeNavigation`) }

  // Example of unpatching a file
  // ignite.patchInFile(`${APP_PATH}/App/Config/AppConfig.js`, {
  //   delete: `import '../ReactNativeNavigation/ReactNativeNavigation'\n`
  // )
}

// Required in all Ignite CLI plugins
module.exports = { add, remove }
