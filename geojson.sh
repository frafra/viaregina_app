(set -ex
rev=$(curl -I http://127.0.0.1:5984/db_points_url/_design/geoJson | grep ETag | cut -d'"' -f 2)
if [[ $rev == "" ]] # new procedure
then
  json=$(tr -d '\n' <geoJson.json | tr -s ' ')
else # update
  json=$(tr -d '\n' <geoJson.json | tr -s ' ' | jq .+{"_rev":\"$rev\"})
fi
curl -H 'Content-Type: application/json' \
  -X POST -d "$json" \
  http://127.0.0.1:5984/db_points_url
)
# curl http://localhost:5984/db_points_url/_design/geoJson/_list/aggregated/by_id/ | jq .
