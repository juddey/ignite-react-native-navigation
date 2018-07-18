function updateAndroidFiles (context, name) {
  const { ignite } = context
  // Android Install

  // build.gradle
  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }`
  })

  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    after: `repositories {`,
    insert: `        google()
        mavenLocal()
        mavenCentral()`
  })

  // settings.gradle
  ignite.patchInFile(`${process.cwd()}/android/settings.gradle`, {
    after: `include ':app'`,
    insert: `include ':react-native-navigation'\nproject(':react-native-navigation').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-navigation/lib/android/app/')`
  })

  // One line, plenty of grief ;)
  ignite.patchInFile(`${process.cwd()}/android/build.gradle`, {
    replace: `classpath 'com.android.tools.build:gradle:2.2.3'`,
    insert: `classpath 'com.android.tools.build:gradle:3.1.3'`
  })

  // app/build.gradle
  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `compileSdkVersion 23`,
    insert: `compileSdkVersion 26`
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
    before: `dependencies {`,
    insert: `configurations.all {
      resolutionStrategy.eachDependency { DependencyResolveDetails details ->
          def requested = details.requested
          if (requested.group == 'com.android.support') {
              details.useVersion "26.1.0"
          }
      }
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
    before: `implementation "com.android.support:appcompat-v7:25.4.0"`,
    insert: `    implementation 'com.android.support:design:26.1.0'`
  })

  ignite.patchInFile(`${process.cwd()}/android/app/build.gradle`, {
    replace: `    compile "com.`,
    insert: `    implementation "com.`,
    force: true
  })

  // android/gradle/wrapper/gradle-wrapper.properties
  // 2.2 versions is not really much of a jump :scream:
  ignite.patchInFile(
    `${process.cwd()}/android/gradle/wrapper/gradle-wrapper.properties`,
    {
      replace: 'gradle-2.14.1-all.zip',
      insert: 'gradle-4.4-all.zip',
      force: true
    }
  )

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
}

module.exports = { updateAndroidFiles }
