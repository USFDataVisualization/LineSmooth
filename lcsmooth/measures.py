import os
import random
import statistics as stats
import string
import math
import scipy.fftpack as scifft
import scipy.stats as scistat
import topology
from entropy import *


def mean(data):
    return stats.mean(data)


def stdev_population(data):
    return stats.pstdev(data)


def stdev_sample(data):
    return stats.stdev(data)


def variance_population(data):
    return stats.pvariance(data)


def variance_sample(data):
    return stats.variance(data)


def snr(data):
    stdev = stdev_sample(data)
    if stdev == 0:
        return math.inf
    return mean(data) / stdev


def covariance(d0, d1):
    cov = np.cov(d0, d1)
    return cov[0, 1]


def pearson_correlation(d0, d1):
    pcc = np.corrcoef(d0, d1)
    return pcc[0, 1]


def spearman_correlation(d0, d1):
    src = scistat.spearmanr(d0, d1)
    return src[0]


def l1_norm(d0, d1):
    diff = np.subtract(d0, d1)
    return np.linalg.norm(diff, ord=1)


def l2_norm(d0, d1):
    diff = np.subtract(d0, d1)
    return np.linalg.norm(diff, ord=2)


def linf_norm(d0, d1):
    diff = np.subtract(d0, d1)
    return np.linalg.norm(diff, ord=np.inf)


def delta_volume(d0, d1):
    return np.sum(d1) - np.sum(d0)


# Calculate of the L2norm of frequency domain
def frequency_preservation(d0, d1):
    fft0 = scifft.rfft(d0)
    fft1 = scifft.rfft(d1)
    diff = np.subtract(fft0, fft1)
    return np.linalg.norm(diff, ord=2)


def signal_to_noise(original, filtered):
    noise = np.subtract(original, filtered)
    n_var = variance_sample(noise)
    if n_var <= 1e-8:
        return 1e10
    else:
        return variance_sample(filtered) / n_var


def approximate_entropy(x):
    # print(perm_entropy(x, order=3, normalize=True))  # Permutation entropy
    # print(spectral_entropy(x, 100, method='welch', normalize=True))  # Spectral entropy
    # print(svd_entropy(x, order=3, delay=1, normalize=True))  # Singular value decomposition entropy
    # print(app_entropy(x, order=2, metric='chebyshev'))  # Approximate entropy
    # print(sample_entropy(x, order=2, metric='chebyshev'))  # Sample entropy
    # print(lziv_complexity('01111000011001', normalize=True))  # Lempel-Ziv complexity
    return app_entropy(x, order=2, metric='chebyshev')


# generate a random string of fixed length
def random_string(stringLength=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))


def __save_pds( orig, filt ):
    pd_org = topology.pd.get_persistence_diagram(orig)
    pd_flt = topology.pd.get_persistence_diagram(filt)
    file_org = random_string(10) + '.pd'
    file_flt = random_string(10) + '.pd'
    topology.pd.save_persistence_diagram(file_org, pd_org)
    topology.pd.save_persistence_diagram(file_flt, pd_flt)
    return file_org, file_flt


def __remove_pds(file_org, file_flt ):
    os.remove(file_org)
    os.remove(file_flt)


def peakiness_bottleneck(original, filtered):
    file_org, file_flt = __save_pds(original, filtered)
    res = topology.pd.bottleneck_distance(file_org, file_flt)
    __remove_pds(file_org, file_flt)
    return res


def peakiness_wasserstein(original, filtered):
    file_org, file_flt = __save_pds(original, filtered)
    res = topology.pd.wasserstein_distance(file_org, file_flt)
    __remove_pds(file_org, file_flt)
    return res


def peakiness(original, filtered):
    file_org, file_flt = __save_pds(original, filtered)
    res_b = topology.pd.bottleneck_distance(file_org, file_flt)
    res_w = topology.pd.wasserstein_distance(file_org, file_flt)
    __remove_pds(file_org, file_flt)
    return {'peak bottleneck': res_b, 'peak wasserstein': res_w}

