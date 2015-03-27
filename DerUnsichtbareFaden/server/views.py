'''
Created on 17.03.2015

@author: kolbe
'''
from . import app, models
from agent import Agent
from flask import render_template, send_from_directory, Response, session
import json

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/info')
def info():
    return render_template('info.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/agent/reset')
def agent_reset():
    session['visited'] = []
    
    return Response()
    
@app.route('/agent/<int:symbol>')
def agent(symbol):
    try:
        app.logger.info(session['visited'])
    except:
        session['visited'] = []
    
    ag = Agent(visited=session['visited'])
    next_article = ag.nextArticle(symbol)
    next_symbols = ag.nextSymbols(symbol)
    
    app.logger.info(next_symbols)
    
    if next_article is not None:
        session['visited'].append(next_article.id)
        return Response( json.dumps({'article' : next_article.json(), 'symbols' : [s.json() for s in next_symbols]}), mimetype='application/json')
    
    ### if article is None, return null and clear visited
    session['visited'] = []
    return Response('null', mimetype='application/json')

@app.route('/upload/images/<string:f>')
def getResource(f=None):
    app.logger.info("serve " + str(f))
    if f is None:
        return None
    
    if f.lower().endswith( ('jpg', 'png', 'tif', 'gif') ):
        return send_from_directory(app.config['IMAGE_DIR'], f)
    else:
        return send_from_directory(app.config['VIDEO_DIR'], f)

@app.route('/texture/<int:article_id>')
def texture(article_id=None):
    if article_id is None:
        return Response()
    
    return send_from_directory(app.config['TEXTURE_DIR'], "%d.png" % article_id)
