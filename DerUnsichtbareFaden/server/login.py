'''
Created on 26.03.2015

@author: kolbe
'''
from . import app, models, lm, forms
from flask import render_template, redirect, request, url_for
from flask.ext.login import login_user, logout_user, current_user, login_required

@lm.user_loader
def load_user(uid):
    return models.User.query.get(int(uid))

@app.route('/logout')
@login_required
def logout():
    '''User logout'''
    logout_user()
    return redirect(url_for('index'))

@app.route('/login', methods = ['GET', 'POST'])
def login():
    '''Login function for user login'''
    if current_user is not None and current_user.is_authenticated():
        return redirect('/admin')
    
    form = forms.Loginform()
    error = None
    
    if form.validate_on_submit():
        name = form.name.data
        password = form.password.data

        if name:
            user = models.User.query.filter_by(name = name).first()
        if user is None:
            form.name.errors.append("Nutzer existiert nicht!")
            error = True       
        elif not user.checkPassword(password):
            form.password.errors.append("Falsches Passwort!")
            error = True 
 
        if error is None:
            login_user(user, remember = True)
            return redirect(request.args.get('next') or url_for('index'))

    return render_template('login.html', form = form)