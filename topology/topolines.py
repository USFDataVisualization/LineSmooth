import math
import topology.pd as pd
from operator import itemgetter
from sklearn.isotonic import IsotonicRegression


def __linear_map(val, in0, in1, out0, out1):
    t = (val - in0) / (in1 - in0)
    return out0 * (1 - t) + out1 * t


def __rebuild(data, filtered_pairs):
    indices = {0, len(data) - 1}

    for p in filtered_pairs:
        if 0 < p['c0'] < len(data)-1: indices.add(p['c0'])
        if 0 < p['c1'] < len(data)-1: indices.add(p['c1'])

    cp_keys = list(map(lambda x: [x, data[x]], indices))
    cp_keys.sort(key=itemgetter(0))

    tmp = [data[0]]
    for i in range(len(cp_keys) - 1):
        ir = IsotonicRegression(increasing=(cp_keys[i][1] < cp_keys[i + 1][1]))
        y = data[cp_keys[i][0]: cp_keys[i + 1][0] + 1]
        y_ = ir.fit_transform(range(len(y)), y)
        tmp.extend(y_[1:])

    return tmp


def filter_tda_threshold(data, threshold):
    cps = pd._extract_cps(data)
    pairs = pd._pair_cps(cps)
    filtered_pairs = filter(lambda p: p['persistence'] >= threshold, pairs)
    return __rebuild(data, filtered_pairs)


def filter_tda_count(data, threshold):
    threshold = min(1, max(0, threshold))
    cps = pd._extract_cps(data)
    pairs = pd._pair_cps(cps)
    count = math.ceil(__linear_map(threshold, 0, 1, len(pairs)-1, 0))
    return __rebuild(data, pairs[count:])


