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
  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/settings.gradle`, {
    after: `include ':app'`,
    insert: `include ':react-native-navigation'\nproject(':react-native-navigation').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-navigation/lib/android/app/')`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    after: `repositories {`,
    insert: `        google()
        mavenLocal()
        mavenCentral()`
  })).toEqual(true)

  // One line, plenty of grief ;)
  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    replace: `classpath 'com.android.tools.build:gradle:2.2.3'`,
    insert: `classpath 'com.android.tools.build:gradle:3.1.3'`
  })).toEqual(true)

  // app/build.gradle
  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compileSdkVersion 23`,
    insert: `compileSdkVersion 26`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `buildToolsVersion "23.0.1"`,
    insert: `buildToolsVersion "27.0.3"`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `minSdkVersion 16`,
    insert: `minSdkVersion 19`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `targetSdkVersion 22`,
    insert: `targetSdkVersion 25`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `targetSdkVersion 25`,
    insert: `missingDimensionStrategy "RNN.reactNativeVersion", "reactNative55"`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    before: `buildTypes {`,
    insert: `    compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
    }`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    before: `dependencies {`,
    insert: `configurations.all {
      resolutionStrategy.eachDependency { DependencyResolveDetails details ->
          def requested = details.requested
          if (requested.group == 'com.android.support') {
              details.useVersion "26.1.0"
          }
      }
  }`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compile "com.android.support:appcompat-v7:23.0.1"`,
    insert: `implementation "com.android.support:appcompat-v7:25.4.0"`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compile fileTree(dir: "libs", include: ["*.jar"])`,
    insert: `implementation fileTree(dir: "libs", include: ["*.jar"])`
  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    after: `implementation "com.android.support:appcompat-v7:25.4.0"`,
    insert: `    implementation project(':react-native-navigation')`
  })).toEqual(true)

// Commented out because the text is never there to find.
//  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
//    before: `implementation "com.android.support:appcompat-v7:25.4.0"`,
//    insert: `     implementation 'com.android.support:design:26.1.0'`
//  })).toEqual(true)

  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `    compile "com.`,
    insert: `    implementation "com.`,
    force: true
  })).toEqual(true)

  // android/gradle/wrapper/gradle-wrapper.properties
  expect(patchInFile.calledWith(`${process.cwd()}/android/gradle/wrapper/gradle-wrapper.properties`, {
    replace: 'gradle-2.14.1-all.zip',
    insert: 'gradle-4.4-all.zip',
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

  expect(patchInFile.callCount).toEqual(25)
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