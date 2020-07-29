import fnmatch
import os
import time
import multiprocessing
import simplejson as json

import lcsmooth.smoothing as lc_smooth
import lcsmooth.measures as lc_measures
import lcsmooth.ranks as lc_ranks


#
#
# Methods and variables for data files
data_dir = './data'
out_dir = './pages/json'

data_groups = ['astro', 'chi_homicide', 'climate_awnd', 'climate_prcp', 'climate_tmax', 'eeg_500', 'eeg_2500',
               'eeg_10000', 'flights', 'nz_tourist', 'stock_price', 'stock_volume', 'unemployment']

filter_list = ['cutoff', 'subsample', 'tda', 'rdp', 'gaussian', 'median', 'mean', 'min', 'max', 'savitzky_golay',
               'butterworth', 'chebyshev']

measures = ['L1 norm', 'Linf norm', 'peak wasserstein', 'peak bottleneck', "pearson cc", "spearman rc",
            "delta volume", "frequency preservation"]

data_sets = {}


#
#
# Methods for generating metric data
def load_json(filename):
    with open(filename) as json_file:
        return json.load(json_file)


def load_dataset(ds, df):
    return load_json(data_dir + "/" + ds + "/" + df + ".json")


def valid_dataset(datasets, ds, df):
    return ds in data_groups and df in datasets[ds]


def process_smoothing(input_signal, filter_name, filter_level):

    start = time.time()
    if filter_name == 'mean':
        output_signal = lc_smooth.mean(input_signal, filter_level)
    elif filter_name == 'min':
        output_signal = lc_smooth.min_filter(input_signal, filter_level)
    elif filter_name == 'max':
        output_signal = lc_smooth.max_filter(input_signal, filter_level)
    elif filter_name == 'gaussian':
        output_signal = lc_smooth.gaussian(input_signal, filter_level)
    elif filter_name == 'median':
        output_signal = lc_smooth.median(input_signal, filter_level)
    elif filter_name == 'savitzky_golay':
        output_signal = lc_smooth.savitzky_golay(input_signal, filter_level, 2)
    elif filter_name == 'cutoff':
        output_signal = lc_smooth.cutoff(input_signal, filter_level)
    elif filter_name == 'butterworth':
        output_signal = lc_smooth.butterworth(input_signal, filter_level, 2)
    elif filter_name == 'chebyshev':
        output_signal = lc_smooth.chebyshev(input_signal, filter_level, 2, 0.001)
    elif filter_name == 'subsample':
        output_signal = lc_smooth.subsample(input_signal, filter_level)
    elif filter_name == 'tda':
        output_signal = lc_smooth.tda(input_signal, filter_level)
    elif filter_name == 'rdp':
        output_signal = lc_smooth.rdp(input_signal, filter_level)
    else:
        output_signal = input_signal
    end = time.time()

    info = {"processing time": end - start,
            "filter level": filter_level,
            "filter name": filter_name}

    res_stats = lc_measures.get_stats(output_signal)
    metrics = lc_measures.get_metrics(input_signal, output_signal)

    return {'input': list(enumerate(input_signal)), 'output': list(enumerate(output_signal)), 'stats': res_stats, 'info': info,
            'metrics': metrics}


# def __generate_filter_metric_data(_input_signal, _filter_name):
#     results = []
#     process_smoothing(_input_signal, _filter_name, 0)  # warm up
#     for i in range(100):
#         res = process_smoothing(_input_signal, _filter_name, float(i + 1) / 100)
#         res.pop('input')
#         res.pop('output')
#         results.append(res)
#     return results


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
        return load_json( my_out_file)

    if _input_data is None:
        _input_data = load_dataset(_dataset, _datafile)

    if _filter_name == 'all':
        results = []
        for _filter in filter_list:
            res = generate_metric_data(_dataset, _datafile, _filter_name=_filter, _input_data=_input_data, quiet=quiet)
            for r in res:
                r.pop('output')
            results += res
    else:
        results = []
        process_smoothing(_input_data, _filter_name, 0)  # warm up
        for i in range(101):
            res = process_smoothing(_input_data, _filter_name, float(i) / 100)
            res.pop('input')
            results.append(res)

    if not quiet:
        print("Saving: " + my_out_file)
    with open(my_out_file, 'w') as outfile:
        # json.dump(results, outfile, indent=4, separators=(',', ': '))
        json.dump(results, outfile)

    return results


def get_all_ranks(datasets):
    res = []

    for ds in datasets:

        overall = {}
        for m in measures:
            overall[m] = dict.fromkeys(filter_list, 0)

        for df in datasets[ds]:
            print( "Ranking:" + df)
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


#
# Metric data is generated when the program is loaded
def __generate_metric_dataset(_ds,_dfs):
    for _df in _dfs:
        print("Checking: " + _ds + " " + _df)
        generate_metric_data(_ds, _df)


#############################################
#############################################
#############################################
#############################################
#############################################

for group in data_groups:
    cur_ds = []
    for data_file in os.listdir(data_dir + "/" + group):
        if fnmatch.fnmatch(data_file, "*.json"):
            cur_ds.append(data_file[:-5])
    data_sets[group] = cur_ds


def run_experiments(generate_parallel=True):
    if generate_parallel:
        jobs = []

        # Create the processes
        for _ds in data_sets:
            if _ds == 'eeg_10000':
                for df in data_sets[_ds]:
                    jobs.append(multiprocessing.Process(target=__generate_metric_dataset, args=[_ds, [df]]))
            else:
                jobs.append(multiprocessing.Process(target=__generate_metric_dataset, args=[_ds, data_sets[_ds]]))

        # Start the processes
        for j in jobs:
            j.start()

        # Ensure all of the processes have finished
        for j in jobs:
            j.join()
    else:
        for _ds in data_sets:
            __generate_metric_dataset(_ds)


if __name__ == "__main__":
    run_experiments()
