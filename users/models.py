"""
Defines the models for the application.

This module contains the definitions
for various models used in the application,
including User, Device, GroupTag, InterestTag, and InterpretationKeysForEmail.
"""

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager


class GroupTag(models.Model):
    """
    Represents a group tag.

    Attributes:
        name (str): The name of the group tag.
    """

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class InterestTag(models.Model):
    """
    Represents an interest tag.

    Attributes:
        name (str): The name of the interest tag.
    """

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class InterpretationKeysForEmail(models.Model):
    """
    Represents interpretation keys for emails.

    Attributes:
        name (str): The name of the interpretation key.
    """

    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    """
    Custom manager for User model.

    Provides methods for creating users.
    """

    def create_user(self,
                    first_name: str,
                    last_name: str,
                    email: str,
                    role: str,
                    password: str = None,
                    approved=False,
                    is_staff=False,
                    is_superuser=False) -> 'CustomUser':
        """
        Creates and saves a regular user with the given details.

        Args:
            first_name (str): The first name of the user.
            last_name (str): The last name of the user.
            email (str): The email address of the user.
            role (str): The role of the user.
            password (str): The password for the user (optional).
            approved (bool): Whether the user is approved (default False).
            is_staff (bool): Whether the user is staff (default False).
            is_superuser (bool):
              Whether the user is a superuser (default False).

        Returns:
            User: The created user object.
        """
        # Validations for the user inputs
        if not email:
            raise ValueError("Users must have an email address")
        if not first_name:
            raise ValueError("Users must have a first name")
        if not last_name:
            raise ValueError("Users must have a last name")

        user = self.model(email=self.normalize_email(email))
        user.first_name = first_name
        user.last_name = last_name
        user.set_password(password)
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.approved = approved

        user.role = role

        user.save(using=self._db)

        return user

    def create_superuser(self,
                         first_name: str,
                         last_name: str,
                         email: str,
                         password: str = None,
                         role='Admin') -> 'CustomUser':
        """
        Creates and saves a superuser with the given details.

        Args:
            first_name (str): The first name of the user.
            last_name (str): The last name of the user.
            email (str): The email address of the user.
            password (str): The password for the user (optional).
            role (str): The role of the user (default 'Admin').

        Returns:
            User: The created superuser object.
        """
        user = self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
            password=password,
            is_staff=True,
            is_superuser=True,
            approved=True,
        )
        user.save(using=self._db)
        return user


class CustomUser(AbstractUser):
    """
    Custom user model.

    Extends the AbstractUser model provided by Django.

    Attributes:
        base_role (str): The base role for users.
        approved (bool): Whether the user is approved.
        first_name (str): The first name of the user.
        last_name (str): The last name of the user.
        email (str): The email address of the user.
        group (str): The group the user belongs to.
        password (str): The password for the user.
        username (None): Username field is not used.
        role (str): The role of the user.
        interest_tags (ManyToManyField):
          The interest tags associated with the user.
        group_tags (ManyToManyField): The group tags associated with the user.
        interpretation_keys_for_emails (ManyToManyField):
          The interpretation keys for emails associated with the user.
    """

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin',
        USER = 'USER', 'User',
        Unapproved = 'Unapproved', 'Unapproved'

    base_role = Role.Unapproved

    approved = models.BooleanField(default=False)

    first_name = models.CharField(verbose_name='First Name', max_length=50)
    last_name = models.CharField(verbose_name='Last Name', max_length=50)
    email = models.EmailField(unique=True, max_length=255)
    group = models.CharField(max_length=100, blank=True)
    password = models.CharField(max_length=255)
    username = None
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=base_role
    )
    interest_tags = models.ManyToManyField(InterestTag, blank=True)
    group_tags = models.ManyToManyField(GroupTag, blank=True)
    interpretation_keys_for_emails = models.ManyToManyField(
        InterpretationKeysForEmail,
        blank=True
    )

    # Attach to UserManager
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'password']

    class Meta:
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return self.email
