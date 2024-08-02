from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Chat(models.Model):
    title = models.CharField(max_length=100)
    memory = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Message(models.Model):
    user_content = models.TextField()
    bot_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
