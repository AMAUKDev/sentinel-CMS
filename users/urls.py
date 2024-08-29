from django.urls import path, re_path, reverse_lazy, include
from django.contrib.auth.views import (
  PasswordResetConfirmView,
  PasswordResetCompleteView,
  PasswordResetView,
  PasswordResetDoneView,
  LogoutView
)
from rest_framework import routers
from users.views import (
  signup,
  index,
  login_user,
  change_password,
  redirect_to_cms
)
from users.viewsets import LoggedInUserViewSet


urlpatterns = [
    path('accounts/', include("django.contrib.auth.urls")),
    path("signup/", signup, name="signup"),
    path("login/", login_user, name="login"),
    path("change-password/", change_password, name="change_password"),
    path(
      'logout/',
      LogoutView.as_view(next_page='/login/'),
      name='logout'
    ),
    path(
      'password_reset/',
      PasswordResetView.as_view(
        template_name='registration/password_reset_form.html',
        success_url=reverse_lazy('users:password_reset_done')
      ),
      name='reset_password'
    ),
    path(
      'reset/<uidb64>/<token>/',
      PasswordResetConfirmView.as_view(
        template_name='registration/password_reset_confirm.html',
        success_url=reverse_lazy('users:password_reset_complete')
      ),
      name='password_reset_confirm'
    ),
    path(
      'password_reset/done/',
      PasswordResetDoneView.as_view(
        template_name='registration/password_reset_done.html'
      ),
      name='password_reset_done'
    ),
    path(
      'reset/done/',
      PasswordResetCompleteView.as_view(
        template_name='registration/password_reset_complete.html'
      ),
      name='password_reset_complete'
    ),
    # Catch-all route to serve React app
    re_path(r'^cms/.*$', index, name='index'),
    path('', redirect_to_cms),  # Redirect root to /pipeclam/
]

router = routers.DefaultRouter()
router.register(r'api/logged_in_user', LoggedInUserViewSet, basename='users')

urlpatterns += router.urls
