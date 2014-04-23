# C.ly

C.ly is an immediate-feedback programming environment for excruciatingly short programs. 

If you are doing functional programming, c.ly can be good for quickly prototyping a function.

If you are teaching others how to program or doing a code demo, c.ly is great for showing your students immediate feedback.

C.ly is also a collaborative programming environment and can be used for remote pair programming.

## Installation

```bash
$ git clone git@github.com:tetsuharu/c.ly.git
$ cd c.ly
$ npm install
$ PORT=3000 node server.js
```
then point your browser to http://localhost:3000/ !

## Heroku
Turns out you can install c.ly on heroku pretty easily, and overcome your so-called 'security concerns' :)

```bash
$ heroku create
$ heroku labs:enable websockets
$ git push heroku master
$ heroku open
```
