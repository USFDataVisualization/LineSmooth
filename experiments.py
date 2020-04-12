import fnmatch
import os
import time

import simplejson as json
import numpy as np

import math

import lcsmooth.smoothing as lc_smooth
import lcsmooth.measures as lc_measures
import lcsmooth.ranks as lc_ranks

import multiprocessing

#
#
# Methods and variables for data files
data_dir = './data'
out_dir = './pages/json'

data_groups = ['climate_prcp', 'climate_max_temp', 'eeg', 'flights',
               'nz_tourist', 'stock_price', 'stock_volume', 'unemployment']
# data_groups = ['chi_homicide']

data_sets = {}

for group in data_groups:
    cur_ds = []
    for data_file in os.listdir(data_dir + "/" + group):
        if fnmatch.fnmatch(data_file, "*.json"):
            cur_ds.append(data_file[:-5])
    data_sets[group] = cur_ds


def load_dataset(ds, df):
    filename = data_dir + "/" + ds + "/" + df + ".json"
    with open(filename) as json_file:
        return json.load(json_file)


def valid_dataset(datasets, ds, df):
    return ds in data_groups and df in datasets[ds]


filter_list = ['cutoff', 'subsample', 'tda', 'rdp', 'gaussian', 'median', 'mean', 'min', 'max', 'savitzky_golay',
               'butterworth', 'chebyshev']


def process_smoothing(input_signal, filter_name, filter_level):
    input_min = min(input_signal)
    input_max = max(input_signal)
    input_range = input_max - input_min

    start = time.time()
    if filter_name == 'cutoff':
        filter_data = lc_smooth.cutoff(input_signal, filter_level, filter_level_func='log1')
    elif filter_name == 'subsample':
        filter_data = lc_smooth.subsample(input_signal, filter_level, filter_level_func='log1')
    elif filter_name == 'tda':
        min_level = math.log(1)
        max_level = math.log(100)
        scaled_level = lc_smooth.__linear_map(filter_level, 1, 0, min_level, max_level)
        level = lc_smooth.__linear_map(math.exp(scaled_level), 1, 100, 0, 1.0)
        # level = filter1d.__linear_map(filter_level, 0, 1, 0, input_range)
        # level = filter1d.__linear_map(filter_level, 0, 1, 1, 0)
        filter_data = lc_smooth.tda(input_signal, level)
    elif filter_name == 'rdp':
        # level = filter1d.__linear_map(filter_level, 0, 1, 0, input_range)
        # level = filter1d.__linear_map(filter_level, 0, 1, 1, 0)
        min_level = math.log(1)
        max_level = math.log(100)
        scaled_level = lc_smooth.__linear_map(filter_level, 1, 0, min_level, max_level)
        level = lc_smooth.__linear_map(math.exp(scaled_level), 1, 100, 0, 1.0)
        filter_data = lc_smooth.rdp(input_signal, level)
    elif filter_name == 'gaussian':
        min_level = math.log(0.1)
        max_level = math.log(len(input_signal) * 0.1)
        scaled_level = lc_smooth.__linear_map(filter_level, 0, 1, min_level, max_level)
        level = math.exp(scaled_level)
        # level = filter1d.__linear_map(filter_level, 0, 1, 0.1, len(input_signal)*0.1 )
        filter_data = lc_smooth.gaussian(input_signal, level)
    elif filter_name == 'median':
        min_level = math.log(1)
        max_level = math.log(len(input_signal) * 0.1)
        scaled_level = lc_smooth.__linear_map(filter_level, 0, 1, min_level, max_level)
        level = math.exp(scaled_level)
        # level = filter1d.__linear_map(filter_level, 0, 1, 1, len(input_signal)*0.1)
        filter_data = lc_smooth.median(input_signal, int(level))
    elif filter_name == 'mean':
        level = lc_smooth.__linear_map(filter_level, 0, 1, 1, 100)
        filter_data = lc_smooth.mean(input_signal, int(level))
    elif filter_name == 'min':
        level = lc_smooth.__linear_map(filter_level, 0, 1, 1, 100)
        filter_data = lc_smooth.min_filter(input_signal, int(level))
    elif filter_name == 'max':
        level = lc_smooth.__linear_map(filter_level, 0, 1, 1, 100)
        filter_data = lc_smooth.max_filter(input_signal, int(level))
    elif filter_name == 'savitzky_golay':
        level = lc_smooth.__linear_map(filter_level, 0, 1, 1, len(input_signal) / 4)
        filter_data = lc_smooth.savitzky_golay(input_signal, int(level) * 2 + 1, 2)
    elif filter_name == 'butterworth':
        level_tmp = lc_smooth.__linear_map(filter_level, 0, 1, 1.1, 9999.9)
        level = math.log(level_tmp) / math.log(10000)
        filter_data = lc_smooth.butterworth(input_signal, 1 - level, 2)
    elif filter_name == 'chebyshev':
        level_tmp = lc_smooth.__linear_map(filter_level, 0, 1, 1.1, 9999.9)
        level = math.log(level_tmp) / math.log(10000)
        filter_data = lc_smooth.chebyshev(input_signal, 1 - level, 2, 0.001)
    else:
        filter_data = list(enumerate(input_signal))
    end = time.time()

    output_signal = list(map(lambda x: x[1], filter_data))

    info = {"processing time": end - start,
            "filter level": filter_level,
            "filter name": filter_name}

    res_stats = lc_measures.get_stats(output_signal)
    metrics = lc_measures.get_metrics(input_signal, output_signal)

    return {'input': list(enumerate(input_signal)), 'output': filter_data, 'stats': res_stats, 'info': info,
            'metrics': metrics}


#
#
# Methods for generating metric data
def __generate_filter_metric_data(_input_signal, _filter_name):
    results = []
    process_smoothing(_input_signal, _filter_name, 0)  # warm up
    for i in range(100):
        res = process_smoothing(_input_signal, _filter_name, float(i + 1) / 100)
        res.pop('input')
        res.pop('output')
        results.append(res)
    return results


def __create_directory(_dir, quiet=False):
    if not os.path.exists(_dir):
        __create_directory(os.path.abspath(os.path.join(_dir, '..')))
        if not quiet:
            print("Creating directory: " + _dir)
        os.mkdir(_dir)


def generate_metric_data(_dataset, _datafile, _filter_name='all', _input_data=None, quiet=False):
    my_out_dir = out_dir + '/' + _dataset + '/' + _datafile + '/'
    __create_directory(my_out_dir)

    my_out_file = my_out_dir + _filter_name + '.json'
    if os.path.exists(my_out_file):
        with open(my_out_file) as json_file:
            return json.load(json_file)

    if _input_data is None:
        _input_data = load_dataset(_dataset, _datafile)

    if _filter_name == 'all':
        results = []
        for _filter in filter_list:
            results += generate_metric_data(_dataset, _datafile, _filter_name=_filter, _input_data=_input_data,
                                            quiet=quiet)
    else:
        results = __generate_filter_metric_data(_input_data, _filter_name)

    if not quiet:
        print("Saving: " + my_out_file)
    with open(my_out_file, 'w') as outfile:
        json.dump(results, outfile, indent=4, separators=(',', ': '))

    return results


#
# Metric data is generated when the program is loaded
def __generate_metric_dataset(_ds):
    for _df in data_sets[_ds]:
        print("Checking: " + _ds + " " + _df)
        generate_metric_data(_ds, _df)


jobs = []
for _ds in data_sets:
    jobs.append(multiprocessing.Process(target=__generate_metric_dataset, args=[_ds]))

# Start the processes (i.e. calculate the random number lists)
for j in jobs:
    j.start()

# Ensure all of the processes have finished
for j in jobs:
    j.join()

# for _ds in data_sets:
#     __generate_metric_dataset(_ds)


#############################################
#############################################
#############################################
#############################################
#############################################
measures = ['L1 norm', 'Linf norm', 'peak wasserstein', 'peak bottleneck', "pearson cc", "spearman rc",
            "delta volume", "frequency preservation"]


def get_all_ranks(datasets):
    res = []

    for ds in datasets:

        overall = {}
        for m in measures:
            overall[m] = dict.fromkeys(filter_list, 0)

        for df in datasets[ds]:
            metric_data = generate_metric_data(ds, df)

            metric_reg = {}
            for m in measures:
                metric_tmp = lc_ranks.metric_ranks(metric_data, filter_list, 'approx entropy', m)
                metric_reg[m] = metric_tmp['result']
                for f in filter_list:
                    overall[m][f] += metric_tmp['result'][f]['rank']

            res.append({'dataset': ds, 'datafile': df, 'rank': metric_reg})

        for m in measures:
            keys = list(overall[m].keys())
            keys.sort(key=(lambda a: overall[m][a]))
            for f in filter_list:
                overall[m][f] = {'rank': keys.index(f) + 1, 'r^2': 1.0}

        res.append({'dataset': ds + '_z', 'datafile': 'overall', 'rank': overall})

    res.sort(key=(lambda a: (a['dataset'] + "_" + a['datafile']).lower()))

    return res
