'''
Created on 17.03.2015

@author: kolbe
'''
from server import app, db
from server.models import Article, Symbol, Node, User
from BeautifulSoup import BeautifulStoneSoup
import csv

if __name__ == '__main__':
    
    articles_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/articles.csv"
    nodes_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/nodes.csv"
    user_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/user.csv"
    symbols_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/symbols.csv"
    article_nodes_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/articlenodes.csv"
    links_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/links.csv"
    sym_links_file = "/home/kolbe/workspace/UnsichtbarerFaden/DerUnsichtbareFaden/tmp/symlinks.csv"
    
    with open(articles_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            try:
                a = Article(id=int(row[0]), name=row[1].decode('utf8'), text=row[2].decode('utf8'), book=int(row[5]))
                print a
                db.session.add(a)
                db.session.commit()
            except Exception, e:
                print e
                db.session.rollback()
    
    with open(nodes_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            try:
                n = Node(id=row[0], name=row[1], pos_x=row[2], pos_y=row[3])
                print n
                db.session.add(n)
                db.session.commit()
            except Exception, e:
                print e
                db.session.rollback()
            
    with open(article_nodes_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            node = Node.query.get(row[1])
            article = Article.query.get(row[0])
            if article is not None and node is not None:
                try:
                    node.articles.append(article)
                    print node, node.articles
                    db.session.commit()
                except Exception, e:
                    print e

    with open(links_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            source = Node.query.get(row[0])
            target = Node.query.get(row[1])
            if source is not None and target is not None:
                try:
                    source.targets.append(target)
                    print source, source.targets
                    db.session.commit()
                except Exception, e:
                    print e                 

    with open(user_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            try:
                u = User(id=row[0], name=row[1], password=row[2])
                print u
                db.session.add(u)
                db.session.commit()
            except Exception, e:
                print e
            
    with open(symbols_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            try:
                icon = unicode(BeautifulStoneSoup(row[2], convertEntities=BeautifulStoneSoup.ALL_ENTITIES))
                s = Symbol(id=row[0], name=row[1], icon=icon)
                print s
                db.session.add(s)
                db.session.commit()
            except Exception, e:
                print e
            
    with open(sym_links_file, 'rb') as f:
        reader = csv.reader(f)
        for row in reader:
            source = Symbol.query.get(row[0])
            target = Symbol.query.get(row[1])
            if source is not None and target is not None:
                try:
                    source.targets.append(target)
                    print source, source.targets
                    db.session.commit()
                except Exception, e:
                    print e  