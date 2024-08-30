from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import (
    CustomUser,
    GroupTag,
    InterestTag,
    InterpretationKeysForEmail
)


class CustomUserAdmin(BaseUserAdmin):
    # Define fields to be displayed in the admin list view
    list_display = (
        'email',
        'first_name',
        'last_name',
        'role',
        'approved',
        'is_active',
        'is_staff',
        'is_superuser',
    )

    # Define fields for ordering
    ordering = ['email']

    # Define fieldsets to organize fields in the admin detail view
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'role')}),
        ('Permissions',
         {'fields': ('is_active', 'is_staff', 'is_superuser', 'approved')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Tags',
         {'fields': (
             'group_tags',
             'interest_tags',
             'interpretation_keys_for_emails'
             )
          }
         ),
    )

    # Specify which fields are editable in the admin detail view
    readonly_fields = ('last_login', 'date_joined')

    # Override the add_fieldsets to match the fields in your custom user model
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'password1',
                'password2',
                'first_name',
                'last_name',
                'role',
                'is_active',
                'is_staff',
                'is_superuser'
            ),
        }),
    )

    # Specify the filter options in the admin list view
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role', 'approved')


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(GroupTag)
admin.site.register(InterestTag)
admin.site.register(InterpretationKeysForEmail)
