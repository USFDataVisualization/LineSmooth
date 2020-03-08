import argparse
import fnmatch
from operator import itemgetter

import simplejson as json
import os
import csv
import datetime


def load_dataset(datasets, ds, df):
    if ds == 'climate' and df in datasets[ds]:
        filename = ds + "/" + df + ".json"

        with open(filename) as json_file:
            cur_dataset = json.load(json_file)
            cur_dataset['data'].sort(reverse=False, key=itemgetter('timestamp'))
            return list(map(lambda X: float(X['value']), cur_dataset['data']))

    elif (ds == 'stock' or ds == 'temperature' or ds == 'radioAstronomy' or ds == 'statistical') and df in datasets[ds]:
        filename = ds + "/" + df + ".json"

        with open(filename) as json_file:
            cur_dataset = json.load(json_file)
            return list(map(lambda X: float(X['value']), cur_dataset['results']))

    eeg_ds = {'eeg_500':500, 'eeg_2500':2500, 'eeg_10000':10000}
    if ds in eeg_ds and df in datasets['eeg']:
        filename = "eeg/" + df + ".csv"
        with open(filename) as csv_file:
            data = [next(csv_file) for x in range(eeg_ds[ds])]
            return list(map(lambda X: float(X), data))

    elif ds == 'stock_close' and df in datasets['stock2']:
        filename = "stock2/" + df + ".csv"
        with open(filename, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            return list(map(lambda X: float(X['Close']), reader))

    elif ds == 'stock_volume' and df in datasets['stock2']:
        filename = "stock2/" + df + ".csv"
        with open(filename, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            return list(map(lambda X: float(X['Volume']), reader))

    elif ds.startswith('climate_'):
        datatype = ds[8:]
        fulldata = []
        for curyear in range(2010,2020):
            with open('climate2/' + df + '_' + str(curyear) + '.json') as json_file:
                cur_dataset = json.load(json_file)
                fulldata += cur_dataset['data']
        subset = list(filter(lambda X: X['datatype']==datatype ,fulldata ))
        subset.sort( key=itemgetter('date'))
        return list(map(lambda X: float(X['value']), subset))

    elif ds == 'flights' and df in ['daily','weekly','monthly']:
        filename = "misc/flights.csv"
        with open(filename, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            data = list(reader)
        
        if df == 'daily':
            return list(map(lambda X: float(X['value']), data))
        if df == 'weekly':
            ret = []
            for i in range(2,len(data)-6,7):
                tot = 0
                for j in range(i,i+7):
                    tot += float(data[j]['value'])
                ret.append(tot)
            return ret
        if df == 'monthly':
            ret = []
            curMonth = '198801'
            curTotal = 0
            for d in data:
                sp = d['date'].split('-')
                m = sp[0] + sp[1]
                if m != curMonth:
                    ret.append( curTotal )
                    curMonth = m
                    curTotal = 0
                curTotal += float( d['value'] )
            ret.append(curTotal)
            return ret

    elif ds == 'nz_tourist' and df in ['monthly','annually']:
        filename = "misc/nz-tourists.csv"
        with open(filename, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            data = list(reader)

        if df == 'monthly':
            return list(map(lambda X: float(X['Close']), data))
        if df == 'annually':
            ret = []
            for i in range(9, len(data) - 11, 12):
                tot = 0
                for j in range(i, i + 12):
                    tot += int(data[j]['Close'])
                ret.append(tot)
            return ret

    unemploy_fields = {'trade': 'Wholesale and Retail Trade', 'manufacturing':'Manufacturing',
                       'hospitality': 'Leisure and hospitality', 'business': 'Business services',
                       'construction': 'Construction', 'edu_health': 'Education and Health',
                       'govt': 'Government', 'finance': 'Finance', 'self_emp': 'Self-employed',
                       'other': 'Other', 'transport': 'Transportation and Utilities',
                       'info': 'Information', 'ag': 'Agriculture', 'mining': 'Mining and Extraction' }

    if ds == 'unemployment' and df in unemploy_fields:
        filename = "misc/unemployment-2.csv"
        with open(filename, newline='') as csvfile:
            reader = csv.DictReader(csvfile)
            return list(map(lambda X: float(X[unemploy_fields[df]]), reader))

    if ds == 'chi_homicide' and df in ['weekly', 'monthly','annually']:
        filename = "misc/chicago-homicide-dates.csv"
        with open(filename, newline='') as csvfile:
            data = list(map((lambda d: datetime.datetime.strptime(d['date'], '%m/%d/%Y %I:%M:%S %p')),csv.DictReader(csvfile)))

        start_date = datetime.datetime(2001, 1, 1)
        end_date = datetime.datetime(2019, 8, 1)

        if df == 'weekly':
            start = start_date
            end = start + datetime.timedelta(days=7)
            res = []
            while end < end_date:
                res.append(len(list(filter((lambda d: start < d < end), data))))
                start = end
                end = start + datetime.timedelta(days=7)

            return res
        if df == 'monthly':
            start = start_date
            end = datetime.datetime( start.year, start.month+1, 1)
            res = []
            while end < end_date:
                res.append(len(list(filter((lambda d: start < d < end), data))))
                start = end
                if start.month == 12:
                    end = datetime.datetime(start.year+1, 1, 1)
                else:
                    end = datetime.datetime(start.year, start.month + 1, 1)

            return res

    return None


def get_datasets( ):
    ret = {}
    for dataset in os.listdir("."):
        if os.path.isdir(dataset):
            cur_ds = []
            for data_file in os.listdir(dataset):
                if fnmatch.fnmatch(data_file, "*.json"):
                    cur_ds.append(data_file[:-5])
                if fnmatch.fnmatch(data_file, "*.csv"):
                    cur_ds.append(data_file[:-4])
            ret[dataset] = cur_ds
    return ret


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Time-varying Graph Subdivder.')
    parser.add_argument('-ds', '--dataset', metavar='[SET]', nargs=1, required=True, help='dataset name')
    parser.add_argument('-df', '--datafile', metavar='[FILE]', nargs=1, required=True, help='data file name')

    args = parser.parse_args()

    ds = args.dataset[0]
    df = args.datafile[0]

    datasets = get_datasets()

    input_signal = load_dataset(datasets, ds, df)

    if input_signal is not None:
        input_signal = list(map((lambda d: float(d)), input_signal))
        print(json.dumps(input_signal))
    else:
        print("unknown dataset: " + ds)
