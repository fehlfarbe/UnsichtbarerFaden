'''
Created on 26.03.2015

@author: kolbe
'''
import sys, signal, os, time, subprocess, os
from tempfile import gettempdir
import lxml.etree
from urllib import pathname2url 

basedir = os.path.abspath(os.path.dirname(__file__))

def replace_image_urls(html, path):
    
    root = lxml.etree.HTML(html)
    for img in root.iter("img"):
        src = img.get("src", None)
        if src is not None:
            src = os.path.basename(src)
            src = os.path.join(path, src)
            img.set('src', pathname2url(src.encode('utf8')))
    return lxml.etree.tostring(root)
        
def html2png(html_data, filename):

    tmp_dir = gettempdir()
    tmp_file = os.path.join(tmp_dir, "duf.html")
    with open(tmp_file, "w") as f:
        f.write(html_data)
    
    script = 'xvfb-run --server-args="-screen 0, 640x480x24" python %s/webkit2png.py --url %s --file %s' % \
            (basedir, tmp_file, filename)
    subprocess.call(script, shell=True)


if __name__ == '__main__':
    from server import models, app
    
    for a in models.Article.query.all():
        print "render:", a.name
        filename = os.path.join(app.config['TEXTURE_DIR'], str(a.id)+".png")
        html2png(replace_image_urls(a.text, app.config['IMAGE_DIR']), filename)