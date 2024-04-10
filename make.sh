#!/bin/bash

mkdir -p www files

case $1 in
    meta | meta/)
        ntex meta/*.tex
        ;;
    examples | examples/)
        rsync -a examples/ files/examples/
        cp -a examples/config.json config.json
        ;;
    www | www/)
        rsync -a --delete wwwsrc/ www/
        rsync -a files/ www/files/
        find www/files -type f -name '*.csv' | cut -d/ -f3- > www/files.txt
        cp -a config.json www/config.json
        ;;
esac

