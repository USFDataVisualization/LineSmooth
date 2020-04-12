import lcsmooth.regression as regression


def __metric_regression(x, y, x_cutoff):

    # res = regression.lls(y, x)
    res = regression.irls(y, x)

    #print( regression.irls(y, x, transform='none') )
    #print( regression.irls(y, x, transform='log') )
    #print()

    m, c = res['result']
    r2 = res['r2']

    x0 = [0, c]
    x1 = [x_cutoff, m * x_cutoff + c]

    if x0[1] < 0: x0 = [-c / m, 0]
    if x1[1] < 0: x1 = [-c / m, 0]

    area = (x0[1] + x1[1]) * (x1[0] - x0[0]) / 2

    return {'points': [x0, x1],
            'area': area,
            'r2': r2}


def metric_ranks(all_metric_data, filters, fieldX, fieldY):
    metric_reg = {}

    x_cutoff = max(map((lambda d: d['metrics'][fieldX]), all_metric_data))

    for f in filters:
        #print(f + " " + fieldX + " " + fieldY)
        filter_metric_data = list(filter(lambda m: m['info']['filter name'] == f, all_metric_data))
        x = list(map((lambda d: d['metrics'][fieldX]), filter_metric_data))
        y = list(map((lambda d: d['metrics'][fieldY]), filter_metric_data))
        metric_reg[f] = __metric_regression(x, y, x_cutoff)

    rank = list(metric_reg.keys())
    rank.sort(key=(lambda m: metric_reg[m]['area']))
    for i in range(len(rank)):
        metric_reg[rank[i]]['rank'] = i + 1

    return {'x': fieldX, 'y': fieldY, 'result': metric_reg}
