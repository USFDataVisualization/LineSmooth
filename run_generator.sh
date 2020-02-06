#!/bin/bash

. venv/bin/activate

export HERA_BOTTLENECK="/Users/prosen/tda/hera/bottleneck_dist"
export HERA_WASSERSTEIN="/Users/prosen/tda/hera/wasserstein_dist"

python generate.py -ds climate -df avgTemp -f cutoff -fl 0.2
python generate.py -ds climate -df avgTemp -f subsample -fl 0.2
python generate.py -ds climate -df aaa_test -f tda -fl 0.2
python generate.py -ds climate -df avgTemp -f rdp -fl 0.2
python generate.py -ds climate -df avgTemp -f gaussian -fl 0.2
python generate.py -ds climate -df avgTemp -f median -fl 0.2
python generate.py -ds climate -df avgTemp -f mean -fl 0.2
python generate.py -ds climate -df avgTemp -f min -fl 0.2
python generate.py -ds climate -df avgTemp -f max -fl 0.2
python generate.py -ds climate -df avgTemp -f savitzky_golay -fl 0.2
python generate.py -ds climate -df avgTemp -f butterworth -fl 0.2
python generate.py -ds climate -df avgTemp -f chebyshev -fl 0.2
python generate.py -ds eeg -df chan01 -f subsample -fl 0.2
python generate.py -ds radioAstronomy -df output_115_116 -f min -fl 0.2
python generate.py -ds statistical -df amzn_price -f rdp -fl 0.2
python generate.py -ds stock -df appl -f median -fl 0.2
python generate.py -ds temperature -df t14-15 -f gaussian -fl 0.2


deactivate

