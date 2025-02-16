#!/usr/bin/env bash
# exit on error
set -o errexit

# upgrade pip
pip install --upgrade pip

# install requirements with --no-cache-dir to ensure fresh install
pip install --no-cache-dir -r requirements.txt

# collect static files
python manage.py collectstatic --no-input

# run migrations
python manage.py migrate
