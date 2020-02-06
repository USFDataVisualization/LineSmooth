import argparse
import fnmatch
import os
import time
from operator import itemgetter

import simplejson as json

import lcsmooth.filter1d as filter1d
import lcsmooth.measures as measures

import common

parser = argparse.ArgumentParser(description='Time-varying Graph Subdivder.')
parser.add_argument('-ds', '--dataset', metavar='[SET]', nargs=1, required=True, help='dataset name')
parser.add_argument('-df', '--datafile', metavar='[FILE]', nargs=1, required=True, help='data file name')
parser.add_argument('-fl', '--filter_level', metavar='[LEVEL]', type=float, nargs=1, required=True,
                    help='Filter level [0,1]')
parser.add_argument('-f', '--filter', metavar='[NAME]', nargs=1, required=True, help='Filter name')

args = parser.parse_args()

ds = args.dataset[0]
df = args.datafile[0]
filter_name = args.filter[0]
filter_level = args.filter_level[0]

data_dir = "data/"
datasets = common.get_datasets(data_dir)

input_signal = common.load_dataset(data_dir, datasets, ds, df)

if input_signal is not None:
    json.dumps(common.process_smoothing(input_signal, filter_name, filter_level))
else:
    print("unknown dataset: " + ds)
