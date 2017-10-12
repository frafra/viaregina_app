# PSAB

## Requirements

### Install Node.js and npm
Ubuntu:
```
# apt install nodejs-legacy
# apt install npm
```

Fedora:
```
# dnf install npm
```

### Install Cordova
```
# npm install -g cordova
```

### Add platforms
```
$ cordova platform add android
$ cordova platform add ios
$ cordova platform add browser
$ # ...
```

### Add plugins
```
$ cordova plugin add cordova-plugin-camera
$ cordova plugin add cordova-plugin-device
$ cordova plugin add cordova-plugin-dialogs
$ cordova plugin add cordova-plugin-file
$ cordova plugin add cordova-plugin-geolocation
$ cordova plugin add cordova-plugin-globalization
$ cordova plugin add cordova-plugin-media-capture
$ cordova plugin add cordova-plugin-network-information
$ cordova plugin add cordova-plugin-whitelist
$ cordova plugin add cordova.plugins.diagnostic
```

### Configure DB
Edit `www/settings.js`, pointing to your CouchDB instance.

### Build and run
```
$ cordova build
$ cordova run
```

### Android
```
# dnf install java-1.8.0-openjdk-devel gradle
$ export PATH=$HOME/Android/Sdk/platform-tools:$PATH
$ cordova platform add android
$ cordova build android
```

### Android (PSAB template)
```
$ cp platforms/android/build/outputs/apk/android-debug.apk template.apk
$ zip -d template.apk 'assets/www/spec.xls'
```

## Issues

## Ad blocking
Please disable `uBlock Origin`.

