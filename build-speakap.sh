#!/bin/bash

bundle install
bin/blade build
cat dist/trix-core.js | sed 's/this\.Trix *=/window.Trix=/' > dist/trix-core-commonjs.js
