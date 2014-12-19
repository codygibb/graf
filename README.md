graf
====
Our beloved graf has recently had its horrible, horrible hackathon code ripped out, and is now being redesigned as a highly modular, scalable, and stable project -- with the backend in Python 3.4 instead of Node.js!

If you want to check out the original version, check under the branch `original_graf`

#### Developing graf

_Note: run all of the following commands from the root of the project_

First download Python 3.4 and pip for Python 3.4 if you haven't:

    $ brew install python3
    $ brew install pip3

To get a development environment set up, you'll need to download all of the dependencies like so:

    $ pip3 install -r requirements.txt
    $ bower install
    $ npm install 

We're using `gulp` to build our `less`, `jade`, and `js` files in `assets/`. All of the compiled code will be placed in `static/`. If you want to make changes to frontend code, check `assets/` (NOT `static/`) for the original, uncompiled code. Here's how to get everything compiled:

    $ gulp

and then, if you want:

    $ gulp watch

will keep an eye on the files in `assets/` and re-compile them whenever they change.

You might want to run all of the unit tests to make sure everything is working smoothly. Here's how:

    $ python3 -m unittest discover -v

If all of the tests pass, start up the `flask` server:

    $ python3 graf.py

