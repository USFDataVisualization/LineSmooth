import lcsmooth.regression as regression
import numpy as np


def __get_area( points ):
    # area = (x0[1] + x1[1]) * (x1[0] - x0[0]) / 2
    area = 0
    for i in range(len(points)-1):
        area += (points[i][1] + points[i+1][1]) * (points[i+1][0] - points[i][0]) / 2
    return area


def __metric_regression(x, y, x_cutoff):

    # res = regression.lls(y, x)
    res = regression.irls(y, x)
    res_log = regression.irls(y, x, transform='log')

    points = []
    if res['r2'] < res_log['r2']:
        m, c = res['result']
        r2 = res['r2']

        x0 = [0, c]
        x1 = [x_cutoff, m * x_cutoff + c]

        if x0[1] < 0: x0 = [-c / m, 0]
        if x1[1] < 0: x1 = [-c / m, 0]

        points = [x0,x1]
    else:
        log_m, log_c = res_log['result']
        r2 = res_log['r2']
        for i in range(20):
            cx = x_cutoff * i / 19
            cy = log_m * cx + log_c
            points.append([cx, np.math.exp(cy)])

    area = __get_area(points)

    return {'points': points,
            'area': area,
            'r2': r2}


def metric_ranks(all_metric_data, filters, fieldX, fieldY):
    metric_reg = {}

    x_cutoff = max(map((lambda d: d['metrics'][fieldX]), all_metric_data))

    for f in filters:
        # print(f + " " + fieldX + " " + fieldY)
        filter_metric_data = list(filter(lambda m: m['info']['filter name'] == f, all_metric_data))
        x = list(map((lambda d: d['metrics'][fieldX]), filter_metric_data))
        y = list(map((lambda d: d['metrics'][fieldY]), filter_metric_data))
        metric_reg[f] = __metric_regression(x, y, x_cutoff)

    rank = list(metric_reg.keys())
    rank.sort(key=(lambda m: metric_reg[m]['area']))
    for i in range(len(rank)):
        metric_reg[rank[i]]['rank'] = i + 1

    return {'x': fieldX, 'y': fieldY, 'result': metric_reg}
