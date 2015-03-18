'''
Created on 17.03.2015

@author: kolbe
'''
from datetime import datetime
from . import app, db

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
    
    #articles = db.relationship('Article',
    #    backref=db.backref('symbol'), lazy='dynamic')
    
    targets = db.relationship(
                    'Symbol',secondary=symbollinks,
                    primaryjoin=symbollinks.c.source==id,
                    secondaryjoin=symbollinks.c.target==id,
                    backref="sources")
    
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
    
    def __repr__(self):
        return "<Node id=%s name=%r x=%s y=%s>" % \
            (self.id, self.name, self.pos_x, self.pos_y)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode(256))
    password = db.Column(db.String(512), nullable=False)
    
    def __repr__(self):
        return "<User id=%s name=%s>" % (self.id, self.name)