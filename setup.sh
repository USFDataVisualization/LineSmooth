#!/bin/bash

# delete old directories
rm -rf __pycache__
rm -rf lcsmooth/__pycache__
rm -rf venv

# Create Virtual Environment
python3 -m venv venv

# Activate the environment
. venv/bin/activate

pip install --upgrade pip

#Within the activated environment, use the following command to install Flask and dependancies:
pip install wheel numpy sklearn simplejson Flask python-dotenv watchdog blinker gunicorn

deactivate

