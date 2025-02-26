#!/bin/bash

docker build -t anguspllg/tisseo:latest -f $(dirname "$0")/../Dockerfile $(dirname "$0")/../
