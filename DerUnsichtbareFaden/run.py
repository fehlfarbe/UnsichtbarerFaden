#!/usr/bin/python

from server import app, manager

if __name__ == '__main__':
    app.run(debug = True, host="0.0.0.0", threaded=True)
