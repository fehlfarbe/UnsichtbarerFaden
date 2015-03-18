'''
Created on 17.03.2015

@author: kolbe
'''
import os

basedir = os.path.abspath(os.path.dirname(__file__))

### directories
IMAGE_DIR = os.path.dirname(os.path.abspath(__file__)) + '/res/uploads'
CACHE_DIR = os.path.dirname(os.path.abspath(__file__)) + '/res/cache'

### cross-site request forgery
CSRF_ENABLED = True
SECRET_KEY = '$1$SvkUqDkd$oi0glIkIBJZy8O3Xsa.kL0'

### SQL
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.abspath(basedir + '/res/system.db')

### Logfile
LOGFILE = os.path.abspath(basedir + '/log/logfile.log')