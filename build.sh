#!/bin/bash

INDEX='public/index.html'
DEST='dist'

if [ $1=='bower' ]
  then bower install
fi

mkdir -p dist/public
cp -r lib dist/lib
cp -r bin dist
cp index.js dist
vulcanize $INDEX -o $DEST/$INDEX --inline --csp --strip
