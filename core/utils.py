import re


def sanitize_string(input_string):
    # Ensure the string is a Unicode string
    # If you're using Python 3, all strings are already Unicode
    # For Python 2, uncomment the following line
    # input_string = unicode(input_string)

    # Replace characters not allowed with underscores
    sanitized = re.sub(r'[^a-zA-Z0-9\-_\.]', '_', input_string)

    # Truncate to 99 characters to ensure length < 100
    sanitized = sanitized[:99]

    return sanitized
