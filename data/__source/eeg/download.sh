#!/bin/bash

# https://www.ncdc.noaa.gov/cdo-web/webservices/v2#data

curl -H "token:IdkPPKFabIQDjtlROfAKOqyMEdgcxPeX" "https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:USW00012842"

echo ""

curl -H "token:IdkPPKFabIQDjtlROfAKOqyMEdgcxPeX" "https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes/AWND"

echo ""


curl -H "token:IdkPPKFabIQDjtlROfAKOqyMEdgcxPeX" "https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:USW00012842&startdate=2010-01-01&enddate=2011-01-01&limit=1000&includemetadata=false" > tmp.txt
