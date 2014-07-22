#!/bin/bash

timestamp="$1"
syntax="$2"

case $syntax in
'clike')
  gcc -x c - -o "$1" 2>&1 && echo -e "\n\n\n" && ./"$1" 2>&1
  rm "$1" 2>/dev/null
  ;;
'python')
  python
  ;;
'javascript')
  node
  ;;
'ruby')
  ruby
  ;;
'haskell')
  cat /dev/stdin > /tmp/b.hs
  ghc -o "$1" /tmp/b.hs 1>&2 && ./"$1" 1>&1 
  
  ;;
'scala') 
	cat /dev/stdin > /tmp/a
	scala -nc /tmp/a  1>&1 
  ;;
'R')
	R --vanilla --slave < /dev/stdin 1>&1 2>&2 
  ;;
'c#')
	cat /dev/stdin > /tmp/a
	gmcs /tmp/a
	mono /tmp/a.exe 
  ;;
'idris')
	cat /dev/stdin > /tmp/a.idr
	idris -o "$1" /tmp/a.idr && ./"$1" 1>&1  
  ;;
'cless')
  lessc --no-color 
  ;;
'rust')
  rustc -
  ./rust_out
  rm rust_out
  ;;
esac 

