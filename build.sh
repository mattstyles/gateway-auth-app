#!/bin/bash

INDEX='public/index.html'
DEST='dist'

mkdir -p dist/public
cp -r lib dist/public/lib
cp -r bin dist
cp index.js dist
vulcanize $INDEX -o $DEST/$INDEX
