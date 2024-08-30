from django.shortcuts import render, redirect
from django.contrib.auth import (
    authenticate,
    get_user_model,
    login,
    update_session_auth_hash
)
from django.contrib.auth.decorators import login_required
from users.forms import SignUpForm, LoginForm, ChangePassword

User = get_user_model()


@login_required
def index(request):
    return render(request, "index.html")


def redirect_to_cms(request):
    return redirect('/cms/')


@login_required
def change_password(request):
    form = ChangePassword(user=request.user, data=request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            update_session_auth_hash(request, form.user)
            return render(request, "index.html", {})
    return render(request, "registration/change_password.html", {"form": form})


def signup(request):
    form = SignUpForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            return redirect("users:login")
    return render(request, "registration/signup.html", {"form": form})


def login_user(request):
    form = LoginForm(data=request.POST or None)
    if form.is_valid():
        username = form.cleaned_data.get("username")
        password = form.cleaned_data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None and user.approved:
            login(request, user)
            return redirect("users:index")
        elif not user.approved:
            form.add_error(
                None,
                (
                    "Your account has not yet been activated, "
                    "an administrator will activate your account shortly."
                )
            )

    return render(request, "registration/login.html", {"form": form})
