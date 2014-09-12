#!/bin/bash

INDEX='public/index.html'
DEST='dist'

if [ $1=='bower' ]
  then bower install
fi

mkdir -p $DEST/public
cp -r lib $DEST
cp -r bin $DEST
cp index.js $DEST
vulcanize $INDEX -o $DEST/$INDEX --inline --csp --strip
