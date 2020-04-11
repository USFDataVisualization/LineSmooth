import json

from flask import Flask, Response
from flask import request
from flask import send_file
from flask import send_from_directory

import experiments
import lcsmooth.ranks as ranks
import webbrowser

app = Flask(__name__)

webbrowser.open_new_tab("http://localhost:5250")

filter_colors = {
    'median': ["#0CE8CC", "#72E8D9"],
    'min': ["#00FF44", "#8AFFAA"],
    'max': ["#59CB07", "#99CC74"],

    'gaussian': ["#3409E8", "#9284E8"],
    'savitzky_golay': ["#184EFF", "#9DB8FF"],
    'mean': ["#099CEB", "#86CCEB"],

    'cutoff': ["#E80C94", "#E884BF"],
    'butterworth': ["#DD00FF", "#F39EFF"],
    'chebyshev': ["#7F0CE8", "#BA84E8"],

    'subsample': ["#E8A20C", "#E8BC6F"],
    'tda': ["#FF7B00", "#FFB987"],
    'rdp': ["#E8410C", "#E8856F"]
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
    return json.dumps(experiments.data_sets)


@app.route('/metric', methods=['GET', 'POST'])
def get_metric_data():
    ds = request.args.get("dataset")
    df = request.args.get("datafile")

    if not experiments.valid_dataset(experiments.data_sets, ds, df):
        print("unknown dataset: " + ds + " or data file: " + df)
        return "{}"

    metric_data = experiments.generate_metric_data(ds, df)
    metric_reg = []

    for f in experiments.measures:
        metric_reg.append(ranks.metric_ranks(metric_data, experiments.filter_list, 'approx entropy', f)),

    return json.dumps({'metric': metric_data, 'rank': metric_reg})


@app.route('/all_ranks', methods=['GET', 'POST'])
def get_all_rank_data():
    return json.dumps(experiments.get_all_ranks(experiments.data_sets))


@app.route('/data', methods=['GET', 'POST'])
def get_data():
    ds = request.args.get("dataset")
    df = request.args.get("datafile")

    if not experiments.valid_dataset(experiments.data_sets, ds, df):
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
        css['.' + key + '_filter'] = {'fill': col_dark, 'stroke': col_dark}
        css['.' + key + '_fig_filter'] = {'fill': 'none', 'stroke': col_dark, 'stroke-width': 3}
        css['.' + key + '_filter_light'] = {'fill': col_light, 'stroke': col_light}

    ret = '\n'
    for key in css.keys():
        val = css[key]
        ret += key + '\n'
        ret += json.dumps(val, indent=2).replace('"', '').replace(',', ';') + '\n\n'

    return Response(ret, mimetype='text/css')
