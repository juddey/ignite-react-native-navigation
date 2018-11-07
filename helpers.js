function updateAndroidFiles (context, name) {
  const { ignite } = context
  const supportLibString = '${rootProject.ext.supportLibVersion}'
  // Android Install.

  // build.gradle
  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        mavenCentral()
        maven { url 'https://jitpack.io' }`
  })

  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    after: `repositories {`,
    insert: `        mavenLocal()
        mavenCentral()`
  })

  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    replace: `minSdkVersion = 16`,
    insert: `minSdkVersion = 19`
  })

  // settings.gradle
  ignite.patchInFile(`${process.cwd()}/android/settings.gradle`, {
    after: `include ':app'`,
    insert: `include ':react-native-navigation'\nproject(':react-native-navigation').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-navigation/lib/android/app/')`
  })

  // app/build.gradle
  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    after: `targetSdkVersion rootProject.ext.targetSdkVersion`,
    insert: `        missingDimensionStrategy "RNN.reactNativeVersion", "reactNative57"`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    before: `buildTypes {`,
    insert: `    compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
    }`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    before: `dependencies {`,
    insert: `configurations.all {
      resolutionStrategy.eachDependency { DependencyResolveDetails details ->
          def requested = details.requested
          if (requested.group == 'com.android.support' && requested.name  != 'mulitdex' ) {
              details.useVersion "${supportLibString}"
          }
      }
  }`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    after: `implementation "com.android.support:appcompat-v7:`,
    insert: `    implementation project(':react-native-navigation')`,
    force: true
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    after: `implementation "com.android.support:appcompat-v7:`,
    insert: `    implementation 'com.android.support:design:26.1.0'`,
    force: true
  })

  // android/gradle.properties
  // Deprecated as of Jul-2018, will be removed Dec 2018.
  // ignite.patchInFile(`${process.cwd()}/android/gradle.properties`, {
  //  after: `android.useDeprecatedNdk=true`,
  //  insert: `android.enableAapt2=false`
  // })

  // MainActivity.java
  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      replace: 'import com.facebook.react.ReactActivity;',
      insert: 'import com.reactnativenavigation.NavigationActivity;'
    }
  )

  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      replace: 'public class MainActivity extends ReactActivity {',
      insert: 'public class MainActivity extends NavigationActivity {'
    }
  )

  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      delete: '@Override\n'
    }
  )

  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      delete: '    protected String getMainComponentName() {\n'
    }
  )

  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      delete: `return "${name.toLowerCase()}";\n`
    }
  )

  ignite.patchInFile(
    `${process.cwd()}/android/app/src/main/java/com/${name.toLowerCase()}/MainActivity.java`,
    {
      delete: `    }\n`
    }
  )

  // package.json
  ignite.patchInFile(`${process.cwd()}/package.json`, {
    after: `"scripts": {`,
    insert: `  "android": "cd ./android && ./gradlew app:assembleDebug && ./gradlew installDebug", `
  })
}

module.exports = { updateAndroidFiles }
