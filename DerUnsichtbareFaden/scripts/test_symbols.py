'''
Created on 17.03.2015

@author: kolbe
'''
from server import app, db
from server.models import Article, Symbol

if __name__ == '__main__':
    
    for sym in Symbol.query.all():
        db.session.delete(sym)
    db.session.commit()
    
    if len(Symbol.query.all()) == 0:
        print "add symbols"
        for i in range(7):
            symbol = Symbol(name=chr(65+i), icon=chr(65+i))
            db.session.add(symbol)
    
    print "add relations"
    symlinks = [ [2, 3, 5, 6, 7],
                    [3, 4,],
                    [1],
                    [],
                    [1, 3, 4],
                    [1, 2, 3, 4, 5, 6, 7],
                    [2, 3, 4, 5]                
                ]
    
    for sym in Symbol.query.all():
        print sym, symlinks[sym.id-1]
        for i in symlinks[sym.id-1]:
            sym.targets.append(Symbol.query.get(i))
        print sym, "-->", sym.targets
    
    
    db.session.commit()
    print "done"