# ignite-react-native-navigation

The awesomess of [ignite](https://github.com/infinitered/ignite) with the awesomeness of [react-native-navigation v2](https://github.com/wix/react-native-navigation), all packaged up for your [react native](https://github.com/facebook/react-native) project.

## Warnings.
 - Like `yarn eject` from `create-react-native-app`, this operation is one-way; but once you have this navigator, you won't want to go anywhere else.
- This plugin supports React Native `0.55` or greater. Lower version support by patching `android/app/build.gradle`, key: `missingDimensionStrategy` to `reactNative51`. <sup>*</sup>
- RNN v2 requires gradle 3.0.1. This plugin will add the required lines to upgrade if you have an earlier version (and you will have, if you just installed `ignited` a new project to try this.)<sup>#</sup>


```js
ignite add ignite-react-native-navigation
```

Enjoy!

### Credits
Shoutouts to: [Odesea](https://github.com/Osedea/ignite-native-navigation) who wrote a plugin for RNN v1, and on whose efforts much of this logic is based. Who knows, we might even combine them in the future. I'm interested.


<hr></hr>
* <small> There's no support for earler RN versions than 51. </small><br>
# <small> The install of gradle 3.0.1 will add about a minute to your `run-android` command next time it runs. But hey, if you've developed with Java before, you're probably used to waiting around. :)</small><br>
<small> Patching files might not work on Windows. If you really, really, really want this, file an issue. </small><br>
