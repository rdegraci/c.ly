#!/bin/bash

gcc -x c - -o "$1" 2>&1 && echo -e "\n\n\n" && ./"$1" 2>&1

rm "$1" 2>/dev/null
