import math
import random
import os
from operator import itemgetter


__hera_bottleneck = os.getenv('HERA_BOTTLENECK')
__hera_wasserstein = os.getenv('HERA_WASSERSTEIN')

if __hera_bottleneck is None or __hera_wasserstein is None or \
        (not os.path.exists(__hera_bottleneck)) or (not os.path.exists(__hera_wasserstein)):
    print("Path to Hera Bottleneck and Wasserstein not set correctly.")
    print("   For example: ")
    print("       > export HERA_BOTTLENECK=\"/bin/tda/hera/bottleneck_dist\"")
    print("       > export HERA_WASSERSTEIN=\"/bin/tda/hera/wasserstein_dist\"")
    print()
    print("These functionalities will be disabled.")
    __hera_bottleneck = None
    __hera_wasserstein = None


def _extract_cps(data):
    ret = []

    b = {'idx': 0, 'val': data[0], 'type': ('min' if (data[0] < data[1]) else 'max')}
    if b['type'] == 'min': ret.append({'idx': -1, 'val': math.inf, 'type': 'max'})
    if b['type'] == 'max': ret.append({'idx': -1, 'val': -math.inf, 'type': 'min'})
    ret.append(b)

    for i in range(1, len(data) - 1):
        if data[i] < data[i - 1] and data[i] <= data[i + 1]:
            ret.append({'idx': i, 'val': data[i], 'type': 'min'})
        if data[i] >= data[i - 1] and data[i] > data[i + 1]:
            ret.append({'idx': i, 'val': data[i], 'type': 'max'})

    e = {'idx': len(data) - 1, 'val': data[-1], 'type': ('min' if (data[-1] < data[-2]) else 'max')}
    ret.append(e)
    if e['type'] == 'min': ret.append({'idx': len(data), 'val': math.inf, 'type': 'max'})
    if e['type'] == 'max': ret.append({'idx': len(data), 'val': -math.inf, 'type': 'min'})

    return ret


def _pair_cps(cps):
    pairs = []

    cps_max = list( filter( (lambda c: c['type'] == 'max'), cps ) )
    cps_max.sort(key=(lambda c: c['val']))

    proc = list(cps)
    for c in cps_max:
        if len(proc) == 1: break

        idx = proc.index(c)
        if idx == 0: rem = proc[idx+1]
        elif idx == len(proc)-1: rem = proc[idx-1]
        elif proc[idx-1]['val'] > proc[idx+1]['val']: rem = proc[idx-1]
        else: rem = proc[idx+1]

        pairs.append({'c0': c['idx'], 'c1': rem['idx'], 'persistence': (c['val']-rem['val'])})
        proc.remove( rem )
        proc.remove( c )

    pairs.sort(key=itemgetter('persistence'))

    return pairs


def get_persistence_diagram(data):
    dtmp = list(map(lambda d: d + random.uniform(-0.0001, 0.0001), data))
    cps = _extract_cps(dtmp)
    pairs = _pair_cps(cps)
    nonzero_pairs = filter(lambda p: p['persistence']>0 and not math.isinf(p['persistence']), pairs)
    return list(map(lambda p: [dtmp[p['c0']], dtmp[p['c1']]], nonzero_pairs))


def save_persistence_diagram(outfile, pd0, pd1=None):
    f = open(outfile, "w")

    for x in pd0:
        f.write(str(x[0]) + " " + str(x[1]) + "\n")

    if pd1 is not None:
        for x in pd1:
            f.write(str(x[0]) + " " + str(x[1]) + "\n")

    f.close()


def wasserstein_distance(pd_file0, pd_file1, rel_error=0.01):
    if __hera_wasserstein is None:
        return 'nan'

    stream = os.popen(__hera_wasserstein + " " + pd_file0 + " " + pd_file1 + " " + str(rel_error))
    output = stream.read()
    stream.close()
    return float(output)


def bottleneck_distance(pd_file0, pd_file1, rel_error=0.01):
    if __hera_bottleneck is None:
        return 'nan'

    stream = os.popen(__hera_bottleneck + " " + pd_file0 + " " + pd_file1 + " " + str(rel_error))
    output = stream.read()
    stream.close()
    return float(output)


