import json
import os
import webbrowser

from flask import Flask
from flask import request
from flask import send_file
from flask import send_from_directory

import experiments as exp
import lcsmooth.ranks as ranks

app = Flask(__name__)

webbrowser.open_new_tab("http://localhost:5250")


def cache_file(cmd, params):
    file = cmd
    for key in sorted(params.keys()):
        file += "_" + str(params[key])
    file = file.replace('.','_').replace(' ','_').replace('/','_').replace('\\','_')
    return 'pages/json/cache/' + file + '.json'


def check_cache(_cache_file):
    return os.path.exists( _cache_file )


def get_cache( _cache_file ):
    return send_file(_cache_file)


def save_cache( _cache_file, str ):
    f = open(_cache_file, "w")
    f.write( str )
    f.close()
    return str


@app.route('/')
@app.route('/index.html')
def render_index():
    return send_file('pages/index.html')


@app.route('/<path:path>')
def send_static_html(path):
    return send_from_directory('pages/', path)


@app.route('/images/<path:path>')
def send_static_images(path):
    return send_from_directory('pages/images', path)


@app.route('/javascript/<path:path>')
def send_static_javascript(path):
    return send_from_directory('pages/javascript', path)


@app.route('/style/<path:path>')
def send_static_style(path):
    return send_from_directory('pages/style', path)


@app.errorhandler(404)
def page_not_found(error_msg):
    print("Error: " + str(error_msg))
    return 'This page does not exist', 404


@app.route('/datasets', methods=['GET', 'POST'])
def get_datasets():
    return json.dumps(exp.data_sets)


@app.route('/metric', methods=['GET', 'POST'])
def get_metric_data():
    ds = request.args.get("dataset")
    df = request.args.get("datafile")

    _cache_file = cache_file('metric', {'dataset':ds, 'datafile':df})
    if check_cache( _cache_file ):
        return get_cache( _cache_file )

    if not exp.valid_dataset(exp.data_sets, ds, df):
        print("unknown dataset: " + ds + " or data file: " + df)
        return "{}"

    metric_data = exp.generate_metric_data(ds, df)
    metric_reg = []

    for f in exp.measures:
        metric_reg.append(ranks.metric_ranks(metric_data, exp.filter_list, 'approx entropy', f)),

    return save_cache( _cache_file, json.dumps({'metric': metric_data, 'rank': metric_reg}) )


@app.route('/all_ranks', methods=['GET', 'POST'])
def get_all_rank_data():
    _cache_file = "pages/json/get_all_rank_data.json"
    if not os.path.exists(_cache_file):
        with open(_cache_file, 'w') as outfile:
            json.dump( exp.get_all_ranks(exp.data_sets), outfile, indent=1)

    return send_file(_cache_file)


@app.route('/data', methods=['GET', 'POST'])
def get_data():
    ds = request.args.get("dataset")
    df = request.args.get("datafile")

    if not exp.valid_dataset(exp.data_sets, ds, df):
        print("unknown dataset: " + ds + " or data file: " + df)
        return "{}"

    _cache_file = cache_file('data', {'dataset': ds, 'datafile': df, 'filter':request.args.get("filter"),
                                        'level': float(request.args.get("level"))})
    if check_cache(_cache_file):
        return get_cache(_cache_file)

    input_signal = exp.load_dataset(ds, df)
    res = exp.process_smoothing(input_signal, request.args.get("filter"), float(request.args.get("level")))

    return save_cache( _cache_file, json.dumps(res))

