#!/usr/bin/env python
import sys
import signal
from optparse import OptionParser
 
# Some of the PyQt libs
from PyQt4.QtCore import *
from PyQt4.QtGui import *
from PyQt4.QtWebKit import *

def onLoadFinished(result):
    print "loadFinished(%s)" % str(result)
    if not result:
        print "Request failed"
        sys.exit(1)
        
    webpage.setViewportSize(webpage.mainFrame().contentsSize())
    # Paint this frame into an image
    image = QImage(webpage.viewportSize(), QImage.Format_ARGB32)
    painter = QPainter(image)
    webpage.mainFrame().render(painter)
    painter.end()
    image.save(options.filename)
    sys.exit(0) # quit this application

if __name__ == '__main__':
    parser = OptionParser()
    parser.add_option("-f", "--file", dest="filename")
    parser.add_option("-u", "--url")
    
    (options, args) = parser.parse_args()
    print options, args
    if options.url is None:
        print "NO URL!"
        sys.exit(1)
    if options.filename is None:
        print "no filename!"
        sys.exit(1)
    
    app = QApplication(sys.argv)
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    webpage = QWebPage()
    webpage.connect(webpage, SIGNAL("loadFinished(bool)"), onLoadFinished)
    webpage.mainFrame().load(QUrl(options.url))
    
    sys.exit(app.exec_())