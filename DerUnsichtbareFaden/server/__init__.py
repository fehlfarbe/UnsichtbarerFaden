'''
Created on 17.03.2015

@author: kolbe
'''
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.admin import Admin
from flask.ext.compress import Compress
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand
from flask.ext.mail import Mail
from flask.ext.babel import Babel

### setup App
app = Flask(__name__)
app.config.from_object('config')
app.secret_key = '13fa3dca096041770b62591dc957d4fd' # for session

### setup SQLAlchemy
db = SQLAlchemy(app)
migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('db', MigrateCommand)

### setup LoginManager
lm = LoginManager()
lm.init_app(app)
lm.login_view = 'login'

### logging
from server import views, admin, login, errorhandler