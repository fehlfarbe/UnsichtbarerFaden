'''
Created on 26.03.2015

@author: kolbe
'''
from flask.ext.wtf import Form
from wtforms import TextField, PasswordField
from wtforms.validators import Required
from wtforms import TextAreaField, TextField, Field
from wtforms.widgets import TextArea, ListWidget, HTMLString, html_params

'''
CKText
'''
class CKTextAreaWidget(TextArea):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class_', 'ckeditor')
        return super(CKTextAreaWidget, self).__call__(field, **kwargs)
 
class CKTextAreaField(TextAreaField):
    widget = CKTextAreaWidget()


class Loginform(Form):
    name = TextField('name', validators = [Required()])
    password = PasswordField('password', validators = [Required()])