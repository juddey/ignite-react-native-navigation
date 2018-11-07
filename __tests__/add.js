const sinon = require('sinon')
const plugin = require('../plugin')
// spy on few things so we know they're called
const addModule = sinon.spy()
const addPluginComponentExample = sinon.spy()
const patchInFile = sinon.spy()
const copy = sinon.spy()
const read = sinon.spy()
const name = 'boilerplate' // Same as the package.json fixture.
const file = sinon.spy()
const generate = sinon.spy()
const remove = sinon.spy()

// grab the package.json fixture
const fixtures = require('./package.json.fixture')

// mock a context
const context = {
  ignite: { addModule, addPluginComponentExample, patchInFile, loadIgniteConfig: () => {
    return { createdWith: '2.1.0',
    examples: 'classic',
    navigation: 'react-navigation',
    askToOverwrite: true,
    generators: 
     { component: 'ignite-ir-boilerplate-bowser',
       screen: 'ignite-ir-boilerplate-bowser' } }
  }
},
  filesystem: { copy, read, file, remove },
  template: { generate }
}

test('adds the proper npm module, and patches relevant files', async () => {
  await plugin.add(context)

  expect(addModule.calledWith('react-native-navigation', {version: '2.1.1', link: true})).toEqual(true)

  // build.gradle
  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        mavenCentral()
        maven { url 'https://jitpack.io' }`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/settings.gradle`, {
    after: `include ':app'`,
    insert: `include ':react-native-navigation'\nproject(':react-native-navigation').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-navigation/lib/android/app/')`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    after: `repositories {`,
    insert: `        mavenLocal()
        mavenCentral()`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    replace: `minSdkVersion = 16`,
    insert: `minSdkVersion = 19`
  })).toEqual(true)

  // app/build.gradle
  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    after: `targetSdkVersion rootProject.ext.targetSdkVersion`,
    insert: `        missingDimensionStrategy "RNN.reactNativeVersion", "reactNative57"`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    before: `buildTypes {`,
    insert: `    compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
    }`
  })).toEqual(true)

const supportLibString = "${rootProject.ext.supportLibVersion}"

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    before: `dependencies {`,
    insert: `configurations.all {
      resolutionStrategy.eachDependency { DependencyResolveDetails details ->
          def requested = details.requested
          if (requested.group == 'com.android.support' && requested.name  != 'mulitdex' ) {
              details.useVersion "${supportLibString}"
          }
      }
  }`
  })).toEqual(true)


  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    after: `implementation "com.android.support:appcompat-v7:`,
    insert: `    implementation 'com.android.support:design:26.1.0'`,
    force: true
  })).toEqual(true)


  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    after: `implementation "com.android.support:appcompat-v7:`,
    insert: `    implementation project(':react-native-navigation')`,
    force: true
  })).toEqual(true)

  // android/gradle.properties
  // Deprecated as of Jul-2018. Will be removed Dec-2018.
  //  expect(patchInFile.calledWith(`${process.cwd()}/android/gradle.properties`, {
  //   after: `android.useDeprecatedNdk=true`,
  //   insert: `android.enableAapt2=false`
  // })).toEqual(true)

  // MainActivity.java
  expect(patchInFile.calledWith(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    replace: 'import com.facebook.react.ReactActivity;',
    insert: 'import com.reactnativenavigation.NavigationActivity;'
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    replace: 'public class MainActivity extends ReactActivity {',
    insert: 'public class MainActivity extends NavigationActivity {'
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: '@Override\n'
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: '    protected String getMainComponentName() {\n'
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: `return "${name.toLowerCase()}";\n`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`, {
    delete: `    }\n`
  })).toEqual(true)

  expect(patchInFile.calledWith(
    `${process.cwd()}/package.json`, {
    after: `"scripts": {`,
    insert: `  "android": "cd ./android && ./gradlew app:assembleDebug && ./gradlew installDebug", `
  })).toEqual(true)


  // iOS
  expect(patchInFile.calledWith(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.m`, {
    after: '#import <React/RCTBundleURLProvider.h>',
    insert: '#import <ReactNativeNavigation/ReactNativeNavigation.h>'
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/ios/${name.toLowerCase()}/AppDelegate.m`, {
    after: 'jsCodeLocation =',
    insert: `  [ReactNativeNavigation bootstrap:jsCodeLocation launchOptions:launchOptions];`,
    force: true
  })).toEqual(true)

  
  expect(patchInFile.callCount).toEqual(18)
  expect(file.callCount).toEqual(3)
  expect(generate.callCount).toEqual(5)
})

test('patches relevant files when correct boilerplate matches', async () => {
  // Only take actions on certain templates
  // find out a better way of supplying package.json
  await plugin.add(context)

  // replace main.tsx
  expect(remove.callCount).toEqual(0)
})