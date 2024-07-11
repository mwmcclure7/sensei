from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
User = get_user_model()

def custom_validation(data):
    email = data['email'].strip()
    password = data['password'].strip()

    if not email or User.objects.filter(email=email).exists():
        raise ValidationError('Email is already in use.')
    
    if not password or len(password) < 8:
        raise ValidationError('Password is invalid. Must contain 8 characters.')
    
    return data
