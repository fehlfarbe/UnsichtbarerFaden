'''
Created on 26.03.2015

@author: kolbe
'''
from . import app, models, db
from flask import redirect, Markup
from flask.ext.login import current_user
from flask.ext.admin import Admin, BaseView, expose
from flask.ext.admin.form.fields import Select2Field
from flask.ext.admin.form import widgets as admin_widgets
from flask.ext.admin.contrib.sqla import ModelView
from flask.ext.admin.contrib.sqla.fields import QuerySelectField, QuerySelectMultipleField
from flask.ext.admin.base import AdminIndexView

'''
Views
'''
class DefaultView(ModelView):
    def is_accessible(self):
        app.logger.info(current_user)
        app.logger.info(current_user.is_anonymous())
        if current_user.is_anonymous():
            return False
        return current_user.is_authenticated()
    
class AdminHomeView(AdminIndexView): 
    def is_accessible(self):
        if current_user.is_anonymous():
            return False
        return current_user.is_authenticated()
    
class LogoutView(BaseView):
    @expose('/')
    def index(self):
        return redirect('logout')


class ArticleView(DefaultView):
    column_default_sort = ('id', True)
    
    column_searchable_list = ('name', 'text')
    column_list = ('id', 'name', 'text', 'book', 'active', 'count')
    column_labels = dict(name='Titel', 
                         text='Vorschau',
                         book='Buch',
                         active='Sichtbar',
                         count='Aufrufe')
    column_formatters = dict(text=lambda v, c, m, p: Markup(m.text))
    '''
    column_descriptions = dict(
        count='Aufrufe'
    )'''
    
    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(ArticleView, self).__init__(models.Article, session, **kwargs)


admin = Admin(app, index_view=AdminHomeView())
admin.add_view(ArticleView(db.session, name="Gedanken"))
admin.add_view(LogoutView(name='Logout', endpoint='logout'))
