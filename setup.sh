#!/bin/bash

# clean
./clean.sh

# Create Virtual Environment
python3 -m venv venv

# Install OpenMP on Mac
if [[ $OSTYPE == 'darwin'* ]]; then
    brew install libomp
fi

# Activate the environment
. venv/bin/activate

pip install --upgrade pip

# Within the activated environment, use the following command to install Flask and dependancies:
pip install wheel
pip install cython
pip install numpy simplejson Flask python-dotenv watchdog blinker gunicorn matplotlib
pip install sklearn

# Install Entropy library
git clone https://github.com/raphaelvallat/entropy.git entropy/
cd entropy/
pip install -r requirements.txt
python setup.py develop
cd ..

deactivate

# Clone hera
git clone https://bitbucket.org/grey_narn/hera.git
cd hera
git checkout 2c5e6c606ee37cd68bbe9f9915dba99f7677dd87
cd ..

# Patching for macport error
if [[ $OSTYPE == 'darwin'* ]]; then
    patch hera/bottleneck/CMakeLists.txt hera_macport.patch
fi


# Build Hera Bottleneck
mkdir hera/bottleneck/bin
cd hera/bottleneck/bin
cmake ..
make bottleneck_dist
cd ../../../

# Build Hera Wasserstein
mkdir hera/wasserstein/bin
cd hera/wasserstein/bin
cmake ..
make wasserstein_dist
cd ../../../




