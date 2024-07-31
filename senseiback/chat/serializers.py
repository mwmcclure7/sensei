from rest_framework import serializers
from chat.models import Chat, Message


class ChatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'title', 'memory', 'created_at', 'author', 'is_active']
        extra_kwargs = {'author': {'read_only': True}}


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user_content', 'bot_content', 'created_at', 'chat']
        extra_kwargs = {'chat': {'read_only': True}}