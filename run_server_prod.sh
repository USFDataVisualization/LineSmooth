#!/bin/bash

. venv/bin/activate

export HERA_BOTTLENECK="/Users/prosen/tda/hera/bottleneck_dist"
export HERA_WASSERSTEIN="/Users/prosen/tda/hera/wasserstein_dist"


gunicorn -b 0.0.0.0:6500 flask_main:app > run_server_prod.log 2>&1  
