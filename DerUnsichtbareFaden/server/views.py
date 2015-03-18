'''
Created on 17.03.2015

@author: kolbe
'''
from . import app, models
from flask import render_template

@app.route('/')
def index():
    return render_template('home.html')