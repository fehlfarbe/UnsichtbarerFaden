'''
Created on 17.03.2015

@author: kolbe
'''
import os, json
from datetime import datetime
from . import app, db
from utils.html2png import html2png, replace_image_urls
from werkzeug.security import check_password_hash, generate_password_hash
from numpy import average

symbollinks = db.Table('symbol_links',
    db.Column('source', db.Integer, db.ForeignKey('symbol.id')),
    db.Column('target', db.Integer, db.ForeignKey('symbol.id'))
)

nodelinks = db.Table('node_links',
    db.Column('source', db.Integer, db.ForeignKey('node.id')),
    db.Column('target', db.Integer, db.ForeignKey('node.id'))
)

articlenodes = db.Table('article_nodes',
    db.Column('article_id', db.Integer, db.ForeignKey('article.id')),
    db.Column('node_id', db.Integer, db.ForeignKey('node.id'))
)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(256), index=True)
    text = db.Column(db.UnicodeText, index=True)
    date = db.Column(db.DateTime)
    texture = db.Column(db.Text, nullable=True)
    book = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, default=False)
    count = db.Column(db.Integer, default=0)
    
    #symbol_id = db.Column(db.Integer, db.ForeignKey('symbol.id'))
    
    comments = db.relationship('Comment',
        backref=db.backref('article'), lazy='dynamic')
    
    nodes = db.relationship("Node",
                    secondary=articlenodes,
                    backref="articles")
    
    def position(self):
        pos_x = []
        pos_y = []
        for n in self.nodes:
            pos_x.append(n.pos_x)
            pos_y.append(n.pos_y)
            
        return average(pos_x), average(pos_y)
    
    def updateTexture(self):
        html = replace_image_urls(self.text, app.config['IMAGE_DIR'])
        filename = os.path.join(app.config['TEXTURE_DIR'], str(self.id)+".png")
        html2png(html, filename)
        
    def json(self):
        x, y = self.position()
        return { 'id' : self.id,
                'text' : self.text.decode('UTF-8'),
                'book' : self.book,
                'x' : x,
                'y' : y,
                'z' : self.book
        }
            
    def __repr__(self):
        return u"<Article id=%s name=%r book=%r active=%s count=%s>" % \
            (self.id, self.name, self.book, self.active, self.count)

    
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(256))
    email = db.Column(db.Unicode(256))
    date = db.Column(db.DateTime, default=datetime.now)
    text = db.Column(db.Text)
    new = db.Column(db.Boolean, default=True)
    
    article_id = db.Column(db.Integer, db.ForeignKey('article.id'))
    
class Symbol(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(64))
    icon = db.Column(db.Unicode(8))
    
    targets = db.relationship(
                    'Symbol',secondary=symbollinks,
                    primaryjoin=symbollinks.c.source==id,
                    secondaryjoin=symbollinks.c.target==id,
                    backref="sources")
    
    def json(self):
        return {'id' : self.id, 'name' : self.name, 'icon' : self.icon}
    
    def __repr__(self):
        return "<Symbol id=%s name=%r icon=%r>" % (self.id, self.name, self.icon)

class Node(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(256), index=True)
    pos_x = db.Column(db.Float, index=True)
    pos_y = db.Column(db.Float, index=True)
    
    targets = db.relationship(
                'Node',secondary=nodelinks,
                primaryjoin=nodelinks.c.source==id,
                secondaryjoin=nodelinks.c.target==id,
                backref="sources")
    
    def selection(self):
        return self.name
    
    def __repr__(self):
        return "<Node id=%s name=%r x=%s y=%s>" % \
            (self.id, self.name, self.pos_x, self.pos_y)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(256))
    password = db.Column(db.String(512), nullable=False)
    
    def checkPassword(self, password):
        return check_password_hash(self.password, password)

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.id)
    
    def __repr__(self):
        return "<User id=%s name=%s>" % (self.id, self.name)