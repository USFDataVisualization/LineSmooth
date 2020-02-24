#!/bin/bash

. venv/bin/activate

export FLASK_APP=flask_main.py

export HERA_BOTTLENECK="/Users/prosen/tda/hera/bottleneck_dist"
export HERA_WASSERSTEIN="/Users/prosen/tda/hera/wasserstein_dist"

flask run --host 0.0.0.0 --port 5250

