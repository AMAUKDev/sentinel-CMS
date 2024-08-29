"""
Serializers for the application.

This module contains serializers for various models used in the application,
including GroupTag, InterestTag, InterpretationKeysForEmail, and User.
These serializers are responsible for serializing and deserializing data
to and from JSON format for communication with the frontend or other services.
"""

from rest_framework import serializers
from users.models import (
  CustomUser,
)


class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.

    This serializer is used for serializing and deserializing User objects.
    """

    class Meta:
        model = CustomUser
        fields = (
            'id', 'first_name',
            'last_name', 'email',
            'role', 'approved',
            'interest_tags', 'group_tags',
            'interpretation_keys_for_emails'
        )
