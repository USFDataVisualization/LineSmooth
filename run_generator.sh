#!/bin/bash

. venv/bin/activate

export HERA_BOTTLENECK="/Users/prosen/tda/hera/bottleneck_dist"
export HERA_WASSERSTEIN="/Users/prosen/tda/hera/wasserstein_dist"


for d in climate eeg stock statistical temperature radioAstronomy
do
    cd data/$d
    arr=()
    for f in `ls *.[cj]*`
    do
        arr+=(`echo $f | cut -d'.' -f 1`)
    done
    cd ../../
    for f in "${arr[@]}"
    do
        echo "python generate.py -ds $d -df $f"
        python generate.py -ds $d -df $f
    done

done

deactivate

