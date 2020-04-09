#!/bin/bash

. venv/bin/activate

export FLASK_APP=flask_main.py

export HERA_BOTTLENECK="hera/bottleneck/bin/bottleneck_dist"
export HERA_WASSERSTEIN="hera/wasserstein/bin/wasserstein_dist"

flask run --host 0.0.0.0 --port 5250

