'''
Created on 26.03.2015

@author: kolbe
'''
from flask.ext.wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import Required


class Loginform(Form):
    name = TextField('name', validators = [Required()])
    password = PasswordField('password', validators = [Required()])