import numpy as np


def irls1d(y, x, maxiter=50, w_init=1, d=0.0001, tolerance=0.001):
    N = len(x)
    delta = np.repeat(d, N)
    A = np.vstack([x, np.ones(N)]).T

    weights = np.repeat(w_init, N)

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

    return {'result': result, 'weights': weights, 'tol': err, 'iter': (i + 1), 'unweighted result': unweighted_result}


if __name__ == "__main__":
    np.random.seed(0)
    AN = 20
    AX = np.random.rand(AN)
    Ay = np.random.rand(AN)
    print(AX)
    print(Ay)
    print()
    print(irls1d(Ay, AX))
