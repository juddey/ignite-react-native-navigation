const sinon = require('sinon')
const plugin = require('../plugin')

test('adds the proper npm module, and patches relevant files', async () => {
  // spy on few things so we know they're called
  const addModule = sinon.spy()
  const addPluginComponentExample = sinon.spy()
  const patchInFile = sinon.spy()
  const copy = sinon.spy()
  const read = sinon.spy()
  const name = 'ignite-react-native-navigation'
  const file = sinon.spy()
  const generate = sinon.spy()

  // mock a context
  const context = {
    ignite: { addModule, addPluginComponentExample, patchInFile },
    filesystem: { copy, read, file },
    template: { generate }
  }

  await plugin.add(context)

  expect(addModule.calledWith('react-native-navigation', {version: '2.0.2362', link: true})).toEqual(true)
  expect(patchInFile.calledWith(`${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        google()
        mavenCentral()`
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
    insert: `classpath 'com.android.tools.build:gradle:3.0.1'`
  })).toEqual(true)

  // app/build.gradle
  expect(patchInFile.calledWith(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compileSdkVersion 23`,
    insert: `compileSdkVersion 25`
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
  expect(patchInFile.calledWith(`${process.cwd()}/android/gradle.properties`, {
    after: `android.useDeprecatedNdk=true`,
    insert: `android.enableAapt2=false`
  })).toEqual(true)

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

  expect(patchInFile.callCount).toEqual(24)
  expect(file.callCount).toEqual(3)
  expect(generate.callCount).toEqual(2)
})
