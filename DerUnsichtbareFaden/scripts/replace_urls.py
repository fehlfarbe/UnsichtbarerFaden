'''
Created on 26.03.2015

@author: kolbe
'''
from server import app, db, models
import re
import lxml.etree, os, urlparse

if __name__ == '__main__':
    
    print "replace it!"
    for a in models.Article.query.all():
        root = lxml.etree.HTML(a.text)
        for img in root.iter("img"):
            src = img.get("src", None)
            print src
            if src is not None:
                if src.startswith('../'):
                    img.set('src', src[2:])
        html = lxml.etree.tostring(root)
        print html   
        a.text= html
    db.session.commit() 
    
    
    
    print "done!"