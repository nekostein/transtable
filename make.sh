#!/bin/bash

mkdir -p www files

case $1 in
    meta | meta/)
        ntex meta/*.tex
        ;;
    examples | examples/)
        rsync -av examples/ files/examples/
        ;;
    www | www/)
        rsync -av --delete wwwsrc/ www/
        rsync -av files/ www/files/
        find www/files -type f -name '*.csv' | cut -d/ -f3- > www/files.txt
        ;;
esac

