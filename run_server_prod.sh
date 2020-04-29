#!/bin/bash

rm *.pd

. venv/bin/activate

export HERA_BOTTLENECK="hera/bottleneck/bin/bottleneck_dist"
export HERA_WASSERSTEIN="hera/wasserstein/bin/wasserstein_dist"

gunicorn -b 0.0.0.0:5250 flask_main:app > run_server_prod.log 2>&1
