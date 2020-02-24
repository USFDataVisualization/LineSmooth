import json
import requests

headers = {'token':'IdkPPKFabIQDjtlROfAKOqyMEdgcxPeX'}


def download_all( url, params={} ):
    count = 1000
    offset = 1
    ret = []
    while offset < count:
        full_url = url + "?includemetadata=true&limit=1000&offset=" + str(offset) + "&" + ("&".join(map((lambda p: p + '=' + params[p]), params.keys())))
        print( full_url )
        res = requests.get(full_url, headers=headers)
        if res.status_code != 200:
            print( res.text )
        else:
            j = json.loads( res.text )
            for r in j['results']:
                ret.append(r)
            count = j['metadata']['resultset']['count']
        offset += 1000
    return ret



datatypes = {}
for r in download_all('https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes'):
    datatypes[r['id']] = r

print( len(datatypes))


downloads = [{ 'locale': 'slc', 'station': 'GHCND:USW00024127'},
             { 'locale': 'atl', 'station': 'GHCND:USW00013874' },
             { 'locale': 'ord', 'station': 'GHCND:USW00094846' },
             { 'locale': 'lax', 'station': 'GHCND:USW00023174' },
             { 'locale': 'sea', 'station': 'GHCND:USW00024233'},
             {'locale': 'jfk', 'station': 'GHCND:USW00094789'}]


for d in downloads:

    for curyear in range( 2010, 2021 ):
        res = download_all('https://www.ncdc.noaa.gov/cdo-web/api/v2/data', {'datasetid': 'GHCND',
                                                                             'stationid': d['station'],
                                                                             'startdate': str(curyear) + '-01-01',
                                                                             'enddate' : str(curyear) + '-12-31',
                                                                             'units': 'standard' } )

        use_dt = {}
        for f in res:
            dt = f['datatype']
            use_dt[dt] = datatypes[dt]

        with open( d['locale'] + '_' + str(curyear) + '.json', 'w') as outfile:
            json.dump({'labels': use_dt, 'data': res }, outfile, indent=2)

#
#
#
#
# url = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/datasets?stationid=GHCND:USW00012842'
# print( requests.get(url, headers=headers).text )
#
# print()
#
# url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?limit=1"
# print( requests.get(url, headers=headers).text )
#
# count = 1000
# offset = 1
# while offset < count:
#     url = "https://www.ncdc.noaa.gov/cdo-web/api/v2/datatypes?limit=1000&offset=" + str(offset)
#     j = json.loads( requests.get(url, headers=headers).text )
#     for r in j['results']:
#         datatypes[r['id']] = r
#     count = j['metadata']['resultset']['count']
#     offset += 1000
# print( len( datatypes) )
#
#
#
# url = 'https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=GHCND:USW00012842&startdate=2010-01-01&enddate=2011-01-01&limit=1000&includemetadata=true&units=standard'
#
# j = json.loads( requests.get(url, headers=headers).text )
#
# for r in j['results']:
#     print( r )
#     if r['datatype'] in datatypes:
#         print( "   " + str(datatypes[r['datatype']]) )
#     else:
#         print( "-> Type not found" )
#     print()
#
