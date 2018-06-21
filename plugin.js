// Ignite CLI plugin for ReactNativeNavigation
// ----------------------------------------------------------------------------

const NPM_MODULE_NAME = 'react-native-navigation'
const NPM_MODULE_VERSION = '2.0.2362'
const jetpack = require('fs-jetpack')
const NPM_PACKAGE = jetpack.read('package.json', 'json')
// :point_up: This is kind of dirty from a test perspective as we're relying on
// the tests to be run in the root directory. Better Implementations welcome!

// const PLUGIN_PATH = __dirname
// const APP_PATH = process.cwd()

const add = async function (context) {
  // Learn more about context: https://infinitered.github.io/gluegun/#/context-api.md
  const { ignite } = context
  const name = NPM_PACKAGE.name

  // Android Install

  // build.gradle
  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        google()
        mavenCentral()`
  })

  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    after: `repositories {`,
    insert: `        google()
        mavenLocal()
        mavenCentral()`
  })

  // One line, plenty of grief ;)
  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    replace: `classpath 'com.android.tools.build:gradle:2.2.3'`,
    insert: `classpath 'com.android.tools.build:gradle:3.0.1'`
  })

  // app/build.gradle
  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compileSdkVersion 23`,
    insert: `compileSdkVersion 25`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `buildToolsVersion "23.0.1"`,
    insert: `buildToolsVersion "27.0.3"`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `minSdkVersion 16`,
    insert: `minSdkVersion 19`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `targetSdkVersion 22`,
    insert: `targetSdkVersion 25`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `targetSdkVersion 25`,
    insert: `missingDimensionStrategy "RNN.reactNativeVersion", "reactNative55"`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    before: `buildTypes {`,
    insert: `    compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
    }`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compile "com.android.support:appcompat-v7:23.0.1"`,
    insert: `implementation "com.android.support:appcompat-v7:25.4.0"`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compile fileTree(dir: "libs", include: ["*.jar"])`,
    insert: `implementation fileTree(dir: "libs", include: ["*.jar"])`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    after: `implementation "com.android.support:appcompat-v7:25.4.0"`,
    insert: `    implementation project(':react-native-navigation')`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `    compile "com.`,
    insert: `    implementation "com.`,
    force: true
  })

  // android/gradle/wrapper/gradle-wrapper.properties
  // 2.2 versions is not really much of a jump :scream:
  ignite.patchInFile(`${process.cwd()}/android/gradle/wrapper/gradle-wrapper.properties`, {
    replace: 'gradle-2.14.1-all.zip',
    insert: 'gradle-4.4-all.zip',
    force: true
  })

  // android/gradle.properties
  ignite.patchInFile(`${process.cwd()}/android/gradle.properties`, {
    after: `android.useDeprecatedNdk=true`,
    insert: `android.enableAapt2=false`
  })

  // MainActivity.java
  ignite.patchInFile(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    replace: 'import com.facebook.react.ReactActivity;',
    insert: 'import com.reactnativenavigation.NavigationActivity;'
  })

  ignite.patchInFile(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    replace: 'public class MainActivity extends ReactActivity {',
    insert: 'public class MainActivity extends NavigationActivity {'
  })

  ignite.patchInFile(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: '@Override'
  })

  ignite.patchInFile(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: '    protected String getMainComponentName() {'
  })

  ignite.patchInFile(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: `return "${name.toLowerCase()}";`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: `    }`
  })

  // install an NPM module and link it
  // Note to self. rn link writes to the pbxproj.
  await ignite.addModule(NPM_MODULE_NAME, { link: true, version: NPM_MODULE_VERSION })

  // Example of copying templates/ReactNativeNavigation to App/ReactNativeNavigation
  // if (!filesystem.exists(`${APP_PATH}/App/ReactNativeNavigation`)) {
  //   filesystem.copy(`${PLUGIN_PATH}/templates/ReactNativeNavigation`, `${APP_PATH}/App/ReactNativeNavigation`)
  // }

  // Example of patching a file
  // ignite.patchInFile(`${APP_PATH}/App/Config/AppConfig.js`, {
  //   insert: `import '../ReactNativeNavigation/ReactNativeNavigation'\n`,
  //   before: `export default {`
  // })
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
