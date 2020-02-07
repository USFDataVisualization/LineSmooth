#!/bin/bash

# delete old directories
rm -rf __pycache__
rm -rf lcsmooth/__pycache__
rm -rf venv
rm -rf entropy

# Create Virtual Environment
python3 -m venv venv

# Activate the environment
. venv/bin/activate

pip install --upgrade pip

#Within the activated environment, use the following command to install Flask and dependancies:
pip install wheel numpy sklearn simplejson Flask python-dotenv watchdog blinker gunicorn matplotlib

git clone https://github.com/raphaelvallat/entropy.git entropy/
cd entropy/
pip install -r requirements.txt
python setup.py develop
cd ..

deactivate

