import numpy as np
import sklearn.metrics


# conventional linear least squares regression
def lls(_y, _x, transform='none'):
    x = np.array(_x)

    if transform == 'log':
        y = np.array(list(map(lambda p: -10 if p <= 1e-10 else np.math.log(p), _y)))
    else:
        y = np.array(_y)

    N = len(x)
    A = np.vstack([x, np.ones(N)]).T

    result = np.linalg.lstsq(A, y, rcond=None)[0]

    if transform == 'log':
        y_res = np.array(list(map( lambda p: np.math.exp(p), np.dot(A, result))))
        r2 = sklearn.metrics.r2_score(np.array(_y), y_res)
    else:
        r2 = sklearn.metrics.r2_score(y, np.dot(A, result) )

    return {'result': result,
            'r^2': r2,
            'transform': transform}


# iteratively reweighted linear least squares regression
def irls(_y, _x, maxiter=50, w_init=1, d=0.0001, tolerance=0.001, transform='none'):
    x = np.array(_x)

    if transform == 'log':
        y = np.array(list(map(lambda p: -10 if p <= 1e-10 else np.math.log(p), _y)))
    else:
        y = np.array(_y)

    N = len(x)
    A = np.vstack([x, np.ones(N)]).T
    weights = np.repeat(w_init, N)
    delta = np.repeat(d, N)

    i, unweighted_result, result, err, _residual = [0, None, None, None, None]

    for i in range(maxiter):
        Aw = A * np.sqrt(weights)[:, None]
        yw = y * np.sqrt(weights)

        result = np.linalg.lstsq(Aw, yw, rcond=None)[0]
        residual = abs(y - np.dot(A, result))
        weights = float(1) / np.maximum(delta, residual)

        if unweighted_result is None:
            unweighted_result = result

        if _residual is not None:
            err = sum(abs(residual - _residual))
            if err < tolerance:
                break

        _residual = residual

    if transform == 'log':
        y_res = np.array(list(map(lambda p: np.math.exp(p), np.dot(A, result))))
        r2 = sklearn.metrics.r2_score(np.array(_y), y_res)
    else:
        r2 = sklearn.metrics.r2_score(y, np.dot(A, result))

    return {'result': result, 'r2': r2, 'weights': weights, 'tol': err, 'iter': (i + 1),
            'unweighted result': unweighted_result, 'transform': transform}


if __name__ == "__main__":
    np.random.seed(0)
    AN = 20
    AX = np.random.rand(AN)
    Ay = np.random.rand(AN)
    print(AX)
    print(Ay)
    print()
    print("Conventional LLS")
    print(lls(Ay, AX))
    print()
    print("IRLS")
    print(irls(Ay, AX))
