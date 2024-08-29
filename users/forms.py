from django.contrib.auth.forms import (
    UserCreationForm,
    AuthenticationForm,
    PasswordChangeForm
)
from users.models import CustomUser as User


class SignUpForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["email"].widget.attrs.update({
            "type": "email",
            "id": "email",
            "name": "email",
            "placeholder": "Email",
            "minlength": 6,
            "maxlength": 100,
            "class": "form-input",
            "required": "required",
        })
        self.fields["password1"].widget.attrs.update({
            "type": "password",
            "id": "password1",
            "name": "password1",
            "placeholder": "Password",
            "minlength": 8,
            "maxlength": 50,
            "class": "form-input",
            "required": "required",
        })
        self.fields["password2"].widget.attrs.update({
            "type": "password",
            "id": "password2",
            "name": "password2",
            "placeholder": "Re-Type Password",
            "minlength": 8,
            "maxlength": 50,
            "class": "form-input",
            "required": "required",
        })
        self.fields["first_name"].widget.attrs.update({
            "type": "text",
            "id": "first_name",
            "name": "first_name",
            "placeholder": "First Name",
            "maxlength": 75,
            "class": "form-input",
            "required": "required",
        })
        self.fields["last_name"].widget.attrs.update({
            "type": "text",
            "id": "last_name",
            "name": "last_name",
            "placeholder": "Last Name",
            "maxlength": 75,
            "class": "form-input",
            "required": "required",
        })

    class Meta:
        model = User
        fields = (
            'email',
            'first_name',
            'last_name',
            'password1',
            'password2'
        )


class LoginForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["username"].widget.attrs.update({
            "type": "email",
            "id": "email",
            "name": "email",
            "placeholder": "Email",
            "minlength": 6,
            "maxlength": 100,
            "class": "form-input",
            "required": "required",
        })
        self.fields["password"].widget.attrs.update({
            "type": "password",
            "id": "password",
            "name": "password",
            "placeholder": "Password",
            "minlength": 8,
            "maxlength": 50,
            "class": "form-input",
            "required": "required",
        })

    class Meta:
        model = User
        fields = (
            'email',
            'password',
        )


class ChangePassword(PasswordChangeForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["old_password"].widget.attrs.update({
            "type": "password",
            "id": "password2",
            "name": "password2",
            "placeholder": "Current Password",
            "minlength": 8,
            "maxlength": 50,
            "class": "form-input",
            "required": "required",
        })
        self.fields["new_password1"].widget.attrs.update({
            "type": "password",
            "id": "password1",
            "name": "password1",
            "placeholder": "New Password",
            "minlength": 8,
            "maxlength": 50,
            "class": "form-input",
            "required": "required",
        })
        self.fields["new_password2"].widget.attrs.update({
            "type": "password",
            "id": "password2",
            "name": "password2",
            "placeholder": "Re-Type Password",
            "minlength": 8,
            "maxlength": 50,
            "class": "form-input",
            "required": "required",
        })

    class Meta:
        model = User
        fields = (
            'old_password',
            'new_password1',
            'new_password2',
        )
