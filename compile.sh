#!/bin/bash

r="`date +%s`_$RANDOM"

# GCC
#gcc -x c - -o "$1" && echo -e "\n\n\n" && ./"$1"; rm "$1" 2>/dev/null

# Ruby
#ruby

# Python
#python

# NodeJS
#node

# GNU Prolog
#cat > "$1".pl;gplc "$1".pl && ./$r;rm $r.pl "$1"

# GHC Haskell
cat > "$1".hs; ghc -v0 -o "$1" "$1".hs && ./"$1"; rm -f "$1" "$1".hs "$1".hi "$1".o
#ghci -v0

# Erlang
#fname="`echo $1|sed 's/\.//g; s/^/tmp/'`"; cat | sed "s/^-module([^)]*)\./-module($fname)./" > $fname.erl; erlc $fname.erl && erl -noshell -s $fname start -s init stop; #rm "$fname"*

