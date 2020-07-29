import json
import experiments
from colorutils import Color
import lcsmooth.ranks as ranks



'''
# Old colors
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
    'rdp': ["#FF7B00", "#FFB987"],
    'tda': ["#E8410C", "#E8856F"]
}
'''

filter_colors = {
    'median': ["#0BDEC3", "#72E8D9"],
    'min': ["#59CB07", "#8AFFAA"],
    'max': ["#ADDB0F", "#99CC74"],

    'gaussian': ["#099CEB", "#86CCEB"],
    'savitzky_golay': ["#184EFF", "#9DB8FF"],
    'mean': ["#2509AF", "#9284E8"],

    'cutoff': ["#E80C94", "#E884BF"],
    'butterworth': ["#DD00FF", "#F39EFF"],
    'chebyshev': ["#7F0CE8", "#BA84E8"],

    'subsample': ["#E8A20C", "#E8BC6F"],
    'rdp': ["#FF7B00", "#FFB987"],
    'tda': ["#E8410C", "#E8856F"]
}


def __write_r2_data():
    with open("tmp.csv", 'w') as outfile:
        with open("pages/json/get_all_rank_data.json") as json_file:
            for d in json.load(json_file):
                for m in d["rank"].keys():
                    for ft in d["rank"][m].keys():
                        if 'r2' in d["rank"][m][ft]:
                            outfile.write( str(d["rank"][m][ft]['r2']) + "\n")
                        elif 'r^2' in d["rank"][m][ft]:
                            outfile.write( str(d["rank"][m][ft]['r^2']) + "\n")
                        else:
                            print("######")
                            print(d["rank"][m][ft])


def __write_color_css():
    css = {}
    for key in filter_colors.keys():
        col_dark = filter_colors[key][0]
        col_light = filter_colors[key][1]
        css['.checkmark-container input:checked ~ .checkmark_' + key] = {'background-color': col_dark}
        css['.' + key + '_background'] = {'background-color': col_dark}
        css['.' + key + '_filter'] = {'fill': col_dark, 'stroke': col_dark}
        css['.' + key + '_regression'] = {'fill': 'none', 'stroke': col_dark, 'stroke-width': 5}
        css['.' + key + '_fig_filter'] = {'fill': 'none', 'stroke': col_dark, 'stroke-width': 3}
        css['.' + key + '_filter_light'] = {'fill': col_light, 'stroke': col_light}
        css['.' + key + '_hollow_filter'] = {'fill': 'white', 'stroke': col_dark, 'stroke-width': 3}
        css['.' + key + '_hollow_filter_light'] = {'fill': 'none', 'stroke': 'none'}

        col_very_light = Color(web=col_light)+Color((10, 10, 10))
        css['.' + key + '_track'] = {'fill': 'none',
                                     'stroke': col_very_light.web, 'stroke-opacity': 0.6, "stroke-width": 8 }
        css['.' + key + '_track2'] = {'fill': 'none',
                                     'stroke': col_very_light.web, 'stroke-opacity': 0.5, "stroke-width": 6 }

    ret = '\n'
    for key in css.keys():
        val = css[key]
        ret += key + '\n'
        ret += json.dumps(val, indent=2).replace('"', '').replace(',', ';') + '\n\n'

    f = open("pages/public/filters.css", "w")
    f.write(ret)
    f.close()


def __write_datasets():
    with open("pages/json/datasets.json", "w") as outfile:
        json.dump(experiments.data_sets, outfile )


def __write_metric_data():

    for ds in experiments.data_sets:
        for df in experiments.data_sets[ds]:
            metric_data = experiments.generate_metric_data(ds, df)
            metric_reg = []

            for f in experiments.measures:
                metric_reg.append(ranks.metric_ranks(metric_data, experiments.filter_list, 'approx entropy', f)),

            with open(experiments.out_dir + '/' + ds + '/' + df + '/metric.json', "w") as outfile:
                json.dump({'metric': metric_data, 'rank': metric_reg}, outfile)


def __write_all_rank_data():
    with open("pages/json/all_rank_data.json", 'w') as outfile:
        json.dump( experiments.get_all_ranks(experiments.data_sets), outfile, indent=1)


##########################################################################################
#
# Operations
#
##########################################################################################
def build():
    __write_color_css()
#    __write_r2_data()
    __write_datasets()
    __write_all_rank_data()
    __write_metric_data()

