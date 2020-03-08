import json

from flask import Flask, Response
from flask import request
from flask import send_file
from flask import send_from_directory

import experiments
import webbrowser
import os

app = Flask(__name__)

datasets = experiments.get_datasets()

for _ds in datasets:
    for _df in datasets[_ds]:
        experiments.generate_metric_data(_ds, _df)

webbrowser.open_new_tab("http://localhost:5250")


filter_colors = {
    'cutoff': [ "#0039e6", "#ccd9ff" ],
    'subsample': [ "#e68a00", "#ffe0b3" ],
    'tda': [ "#00802b", "#80ffaa" ],
    'rdp': [ "#b30000", "#ff9999" ],
    'gaussian': [ "#9900cc", "#ecb3ff" ],
    'median': [ "#86592d", "#ecd9c6" ],
    'mean': [ "#ff33ff", "#ffccff" ],
    'min': [ "#00b8e6", "#b3f0ff" ],
    'max': [ "#408000", "#b3ff66" ],
    'savitzky_golay': [ "#802b00", "#ffbb99" ],
    'butterworth': [ "#6600cc", "#d9b3ff" ],
    'chebyshev': [ "#0086b3", "#99e6ff" ]
}


@app.route('/')
@app.route('/index.html')
def render_index():
    return send_file('pages/index.html')


@app.route('/figures.html')
def render_figures():
    return send_file('pages/figures.html')


@app.route('/ranks.html')
def render_ranks():
    return send_file('pages/ranks.html')


@app.route('/performance.html')
def render_performance():
    return send_file('pages/performance.html')


@app.route('/public/<path:path>')
def send_static(path):
    return send_from_directory('pages/public', path)


@app.errorhandler(404)
def page_not_found(error_msg):
    print("Error: " + str(error_msg))
    return 'This page does not exist', 404


@app.route('/datasets', methods=['GET', 'POST'])
def get_datasets():
    return json.dumps(datasets)


@app.route('/metric', methods=['GET', 'POST'])
def get_metric_data():
    ds = request.args.get("dataset")
    df = request.args.get("datafile")

    if not experiments.valid_dataset(datasets, ds, df):
        print("unknown dataset: " + ds + " or data file: " + df)
        return "{}"

    metric_data = experiments.generate_metric_data(ds, df)
    metric_reg = [experiments.metric_regression(metric_data, 'approx entropy', 'L1 norm'),
                  experiments.metric_regression(metric_data, 'approx entropy', 'L_inf norm'),
                  experiments.metric_regression(metric_data, 'approx entropy', 'peak wasserstein'),
                  experiments.metric_regression(metric_data, 'approx entropy', 'peak bottleneck')]

    return json.dumps({'metric': metric_data, 'rank': metric_reg})


@app.route('/all_ranks', methods=['GET', 'POST'])
def get_all_rank_data():
    return json.dumps( experiments.metric_ranks(datasets) )


@app.route('/data', methods=['GET', 'POST'])
def get_data():
    ds = request.args.get("dataset")
    df = request.args.get("datafile")

    if not experiments.valid_dataset(datasets, ds, df):
        print("unknown dataset: " + ds + " or data file: " + df)
        return "{}"

    input_signal = experiments.load_dataset(ds, df)
    res = experiments.process_smoothing(input_signal, request.args.get("filter"), float(request.args.get("level")))

    return json.dumps(res)


@app.route('/public/filters.css', methods=['GET', 'POST'])
def get_filter_css():
    css = {}

    for key in filter_colors.keys():
        col_dark = filter_colors[key][0]
        col_light = filter_colors[key][1]
        css['.checkmark-container input:checked ~ .checkmark_' + key] = {'background-color': col_dark}
        css['.' + key + '_background'] = {'background-color': col_dark}
        css['.' + key + '_filter'] = {'fill': col_dark,'stroke': col_dark}
        css['.' + key + '_fig_filter'] = {'fill': 'none','stroke': col_dark, 'stroke-width': 3}
        css['.' + key + '_filter_light'] = {'fill': col_light,'stroke': col_light}

    ret = '\n'
    for key in css.keys():
        val = css[key]
        ret += key + '\n'
        ret += json.dumps(val,indent=2).replace('"','').replace(',',';') + '\n\n'

    return Response(ret, mimetype='text/css')
