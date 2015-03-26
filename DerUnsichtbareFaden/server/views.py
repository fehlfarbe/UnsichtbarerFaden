'''
Created on 17.03.2015

@author: kolbe
'''
from . import app, models
from flask import render_template, send_from_directory

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/info')
def info():
    return render_template('info.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/upload/images/<string:f>')
def getResource(f=None):
    app.logger.info("serve " + str(f))
    if f is None:
        return None
    
    if f.lower().endswith( ('jpg', 'png', 'tif', 'gif') ):
        return send_from_directory(app.config['IMAGE_DIR'], f)
    else:
        return send_from_directory(app.config['VIDEO_DIR'], f)