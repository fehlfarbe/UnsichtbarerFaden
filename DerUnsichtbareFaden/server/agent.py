'''
Created on 18.03.2015

@author: kolbe
'''
from . import app, db
from models import Article, Node, Symbol

class Agent(object):
    
    def __init__(self, visited=[]):
        self.visited = visited
        
    def nextArticle(self, symbol):
        
        query = Article.query.filter_by(active=True)
        
        # start article if no symbol or last visited articles
        if len(self.visited) == 0:
            # ToDo: WHAT ABOUT THE START SYMBOL?
            return query.filter_by(book=0).order_by(db.func.random()).first()
        
        last_article = Article.query.get(self.visited[-1])
        app.logger.info("Last article: %s" % str(last_article))
        
        # moeglich: book >= lastbook, minimum 1 equal node
        if symbol == 1:
            selected = query.filter(Article.book >= last_article.book).\
                        filter(Article.id.notin_(self.visited)).\
                        order_by(db.func.random()).all()
            # check for minimum 1 equal node
            last_article_nodes = set(last_article.nodes)
            for a in selected:
                if len(set(a.nodes) & last_article_nodes) > 0:
                    return a
        # notwendig: book >= lastbook, max(node==node)
        elif symbol == 2:
            selected = query.filter(Article.book >= last_article.book).\
                        filter(Article.id.notin_(self.visited)).\
                        order_by(db.func.random()).all()
            # check for maximum equal nodes
            maximum = 0
            article = None
            last_article_nodes = set(last_article.nodes)
            for a in selected:
                l = len(set(a.nodes) & last_article_nodes)
                if l > maximum:
                    maximum = l
                    article = a
            if maximum > 0:
                return article
            else:
                return None
        # wahr: book >= lastbook
        elif symbol == 3:
            return query.filter(Article.book >= last_article.book).\
                        filter(Article.id.notin_(self.visited)).\
                        order_by(db.func.random()).first()
        # not: game over!
        elif symbol == 4:
            return None
        # kontigent: minimum 1 equal node
        elif symbol == 5:
            selected = query.filter(Article.id.notin_(self.visited)).\
                        order_by(db.func.random()).all()
            # check for minimum 1 equal node
            last_article_nodes = set(last_article.nodes)
            for a in selected:
                if len(set(a.nodes) & last_article_nodes) > 0:
                    return a
        # infinity: select random
        elif symbol == 6:
            return query.filter(Article.id != last_article.id).\
                        order_by(db.func.random()).first()
        # wirklich: max(node==node)
        elif symbol == 7:
            selected = query.filter(Article.id.notin_(self.visited)).\
                        order_by(db.func.random()).all()
            # check for maximum equal nodes
            maximum = 0
            article = None
            last_article_nodes = set(last_article.nodes)
            for a in selected:
                l = len(set(a.nodes) & last_article_nodes)
                if l > maximum:
                    maximum = l
                    article = a
            if maximum > 0:
                return article
            else:
                return None
        
        return None
    
    def nextSymbols(self, symbol):
        symbol = Symbol.query.get(symbol)
        if symbol:
            return symbol.targets
        return None
        