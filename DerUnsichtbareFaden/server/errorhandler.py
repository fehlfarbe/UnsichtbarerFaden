'''
Created on 26.03.2015

@author: kolbe
'''
from . import app
from flask import redirect

@app.errorhandler(403)
def page_forbidden(e):
    return redirect('login')