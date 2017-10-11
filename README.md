# Via Regina

Via Regina, on the West coast of Lake Como in the Northernmost part of Italy has been a trade route since the ancient Roman times and an old pilgrim route of cultural exchange between Italy and Switzerland. The app is developed within the scope of an INTERREG project (Crossborder Cooperation Operational Programme Italy - Switzerland 2007-2013), focused on the Via Regina region. The project aims at promoting, rediscovering and enhancing the naturalistic, artistic and cultural heritage along Via Regina. The app allows users to report a range of tourism related elements while walking along the slow tourism paths. Users are asked to classify the element and provide additional information about it. The elements reported are displayed on a map and are available to all the users.


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

## Issues

## Ad blocking
Please disable `uBlock Origin`.

