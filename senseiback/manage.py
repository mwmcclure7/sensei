#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'senseiback.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

# My management commands
from django.contrib.auth import get_user_model
from chat.models import Chat

User = get_user_model()

def list_users():
    users = User.objects.all()
    for user in users:
        print(user, user.is_active)

def set_active(email, active):
    user = User.objects.filter(email=email).first()
    if user:
        user.is_active = active
        user.save()
        print(user, user.is_active)
    else:
        print('User not found')

def list_chats(email):
    user = User.objects.filter(email=email).first()
    if user:
        chats = user.chats.all()
        for chat in chats:
            print(chat.id, chat.title, chat.is_active)
    else:
        print('User not found')

def list_messages(chat_id):
    chat = Chat.objects.filter(id=chat_id).first()
    if chat:
        messages = chat.messages.all()
        for message in messages:
            print(message)
    else:
        print('Chat not found')