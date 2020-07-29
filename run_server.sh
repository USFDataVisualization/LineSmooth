#!/bin/bash

rm *.pd

. venv/bin/activate

export HERA_BOTTLENECK="hera/bottleneck/bin/bottleneck_dist"
export HERA_WASSERSTEIN="hera/wasserstein/bin/wasserstein_dist"

python build_static.py


export FLASK_APP=flask_main.py

flask run --host 0.0.0.0 --port 5250

