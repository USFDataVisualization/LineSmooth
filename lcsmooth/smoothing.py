import numpy as np
import scipy.fftpack as scifft
import scipy.ndimage as scind
import scipy.signal as scisig

import rdp.rdp as mod_rdp
import topology.topolines as topology
import math


def __linear_map(val, in0, in1, out0, out1):
    t = (val - in0) / (in1 - in0)
    return out0 * (1 - t) + out1 * t


def __lerp(t, out0, out1):
    return out0 * (1 - t) + out1 * t


def __linear_map_points(data, points):
    outdata = []
    j = 0
    for i in range(0, len(data) - 1):
        if points[j + 1][0] < i:
            j += 1
        p0 = points[j]
        p1 = points[j + 1]
        # outdata.append([i, __linear_map(i, p0[0], p1[0], p0[1], p1[1])])
        outdata.append( __linear_map(i, p0[0], p1[0], p0[1], p1[1]))
    # outdata.append([len(data) - 1, data[-1]])
    outdata.append(data[-1])
    return outdata


def __filter_level_scale_log(filter_level, log_scale):
    scaled_level = __lerp(filter_level, math.exp(0), math.exp(log_scale))
    return math.log(scaled_level)


#
#
# RANK FILTERS
def median(data: list, filter_level: float):
    width = math.exp(__lerp(filter_level, math.log(1), math.log(len(data) * 0.1)))
    return scind.median_filter(data, size=int(width), mode='nearest')


def min_filter(data: list, filter_level: float):
    width = __lerp(filter_level, 1, min(200, int(len(data)*0.1)) )
    return scind.minimum_filter(data, size=int(width), mode='nearest')


def max_filter(data: list, filter_level: float):
    width = __lerp(filter_level, 1, min(200, int(len(data)*0.1)) )
    return scind.maximum_filter(data, size=int(width), mode='nearest')


#
#
# CONVOLUTIONAL FILTERS
def gaussian(data: list, filter_level: float):
    sigma_val = math.exp(__lerp(filter_level, math.log(0.1), math.log(len(data) * 0.1)))
    return scind.gaussian_filter1d(data, sigma=sigma_val, mode='nearest')


def mean(data: list, filter_level: float):
    width = int(__lerp(filter_level, 1, len(data)*0.1 ))
    pad_pre = int(width / 2)
    pad_post = width - 1 - pad_pre
    tmp = np.pad(data, [(pad_pre, pad_post)], mode='edge')
    return np.convolve(tmp, np.ones((width,)) / width, mode='valid')


def savitzky_golay(data: list, filter_level: float, polyorder: int):
    level = __linear_map(filter_level, 0, 1, 1, len(data) / 4)
    window_length = int(level) * 2 + 1

    return scisig.savgol_filter(data, window_length, polyorder, mode='nearest')


#
#
# FREQUENCY DOMAIN FILTERS
def cutoff(data, filter_level: float ):
    level = __filter_level_scale_log(filter_level,1)
    cutoff_freq = int(__linear_map(level, 0, 1, len(data), 2))
    fft = scifft.rfft(data)
    fft[cutoff_freq:] = 0
    return scifft.irfft(fft)


def butterworth(data, filter_level: float, order: int):
    level_tmp = __linear_map(filter_level, 0, 1, 1.1, 9999.9)
    level = math.log(level_tmp) / math.log(10000)
    cutoff_freq = 1 - level
    b, a = scisig.butter(order, cutoff_freq, btype='low')
    return scisig.lfilter(b, a, data)


def chebyshev(data, filter_level: float, order: int, ripple_db: float):
    level_tmp = __linear_map(filter_level, 0, 1, 1.1, 9999.9)
    level = math.log(level_tmp) / math.log(10000)
    cutoff_freq = 1 - level
    b, a = scisig.cheby1(order, ripple_db, cutoff_freq, btype='low')
    return scisig.lfilter(b, a, data)


def elliptical(data, filter_level: float, order: int, ripple_db: float, max_atten_db: float):
    level_tmp = __linear_map(filter_level, 0, 1, 1.1, 9999.9)
    level = math.log(level_tmp) / math.log(10000)
    cutoff_freq = 1 - level
    b, a = scisig.ellip(order, ripple_db, max_atten_db, cutoff_freq, btype='low')
    return scisig.lfilter(b, a, data)


#
#
# SUBSAMPLING FILTERS
def subsample(data, filter_level: float):
    level = __filter_level_scale_log(filter_level,1)
    num_out_points = int(__linear_map(level, 0, 1, len(data), 4))
    keys = [[0, data[0]]]
    for i in range(1, num_out_points - 1):
        idx = __linear_map(i, 0, num_out_points - 1, 0, len(data) - 1)
        i0 = int(np.math.floor(idx))
        i1 = i0 + 1

        keys.append([idx, __linear_map(idx, i0, i1, data[i0], data[i1])])
    keys.append([len(data) - 1, data[-1]])
    return __linear_map_points(data, keys)


def rdp(data, filter_level: float):
    scaled_level = __linear_map(filter_level, 1, 0, math.log(1), math.log(100))
    eps = __linear_map(math.exp(scaled_level), 1, 100, 0, 1.0)

    dtmp = list(enumerate(data))
    count = math.ceil(__linear_map(eps, 0, 1, 1, len(dtmp)))
    tmp = mod_rdp.rdp_iter_count(dtmp, count)
    return __linear_map_points(data, tmp)


def tda(data, filter_level: float):
    scaled_level = __linear_map(filter_level, 1, 0, math.log(1), math.log(100))
    threshold = __linear_map(math.exp(scaled_level), 1, 100, 0, 1.0)
    return topology.filter_tda_count(data, threshold)

