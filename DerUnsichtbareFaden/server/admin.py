'''
Created on 26.03.2015

@author: kolbe
'''
import os, time
from . import app, models, db
from flask import redirect, Markup, request, render_template
from werkzeug.utils import secure_filename
from flask.ext.login import current_user
from flask.ext.admin import Admin, BaseView, expose
from flask.ext.admin.form.fields import Select2Field
from flask.ext.admin.form import widgets as admin_widgets
from flask.ext.admin.contrib.sqla import ModelView
from flask.ext.admin.contrib.sqla.fields import QuerySelectField, QuerySelectMultipleField
from flask.ext.admin.base import AdminIndexView
from flask.ext.login import login_user, logout_user, current_user, login_required
from forms import CKTextAreaField, CKTextAreaWidget

'''
Views
'''
class DefaultView(ModelView):
    def is_accessible(self):
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
    column_list = ('id', 'name', 'text', 'book', 'active', 'count', 'nodes')
    column_labels = dict(name='Titel', 
                         text='Vorschau',
                         book='Buch',
                         active='Sichtbar',
                         count='Aufrufe')
    column_formatters = dict(text=lambda v, c, m, p: Markup(m.text),
                             active=lambda v, c, m, p: Markup('Ja') if m.active else Markup('Nein'),
                             nodes=lambda v, c, m, p: ", ".join([n.name for n in m.nodes]))
    
    ### edit
    form_columns = ('name', 'text', 'book', 'active', 'nodes')
    create_template = 'admin/cke_edit.html'
    edit_template = 'admin/cke_edit.html'
    form_overrides = dict(text=CKTextAreaField)
    form_args = dict(
        nodes=dict(query_factory=lambda: models.Node.query.order_by(models.Node.id.desc()), get_label=models.Node.selection),
    )
    
    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(ArticleView, self).__init__(models.Article, session, **kwargs)
        
    def after_model_change(self, form, model, is_created):
        model.updateTexture()
        
class NodeView(DefaultView):
    
    column_searchable_list = ('name', )
    column_list = ('id', 'name', 'pos_x', 'pos_y', 'articles')
    column_labels = dict(name='Name', 
                         articles='# Gedanken')
    
    column_formatters = dict(articles=lambda v, c, m, p: len(m.articles))   
    ### edit
    form_columns = ('name', )
    
    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(NodeView, self).__init__(models.Node, session, **kwargs)

        
class CommentView(DefaultView):
    can_create = False
    
    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(CommentView, self).__init__(models.Comment, session, **kwargs)
        
class SymbolView(DefaultView):
    can_create = False
    column_list = ('id', 'name', 'icon', 'targets')
    
    column_labels = dict(name='Name', 
                         icon='Symbol',
                         book='Buch',
                         targets='Bringt dich zu...')
    column_formatters = dict(targets=lambda v, c, m, p: ", ".join(["%s (%s)" % (n.name, n.icon) for n in m.targets]))
    
    
    def __init__(self, session, **kwargs):
        # You can pass name and other parameters if you want to
        super(SymbolView, self).__init__(models.Symbol, session, **kwargs)  
#############################################################################
#
#
# CKEditor file upload / browsing
#
#
#############################################################################
@app.route('/admin/browse')
@login_required
def browse():
    funcNum = request.values.get('CKEditorFuncNum', None)
    files = os.listdir(app.config['IMAGE_DIR'])
    files.sort()
    files = [f.decode('UTF-8') for f in files]
    return render_template('admin/browse.html',
                           files=files,
                           funcNum=funcNum)

@app.route('/admin/upload', methods=['GET', 'POST'])
@login_required
def upload():
    funcNum = request.values.get('CKEditorFuncNum', None)
    app.logger.info(request.files)
    img = request.files.get('upload')
    app.logger.info(img)
    filename = "%d_%s" % (time.time(), secure_filename(img.filename))
    img.save(os.path.join(app.config['IMAGE_DIR'], filename))
    return render_template('admin/upload.html',
                           f=filename,
                           funcNum=funcNum)

admin = Admin(app, index_view=AdminHomeView())
admin.add_view(ArticleView(db.session, name="Gedanken"))
admin.add_view(CommentView(db.session, name="Kommentare"))
admin.add_view(NodeView(db.session, name="Meme"))
admin.add_view(SymbolView(db.session, name="Symbole"))
admin.add_view(LogoutView(name='Logout', endpoint='logout'))
