# Server

Fedora:
```
# dnf install couchdb
# systemctl start couchdb
# systemctl enable couchdb
# npm install -g add-cors-to-couchdb
$ add-cors-to-couchdb
$ curl -X PUT http://localhost:5984/db_points_url
$ ./geojson.sh
```
