from rest_framework import serializers
from chat.models import Chat, Message, Course, Unit


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'user_content', 'bot_content', 'created_at']


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'title', 'memory', 'created_at', 'author', 'messages', 'is_active']
        extra_kwargs = {'author': {'read_only': True}}


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ['id', 'title', 'description', 'content', 'order', 'is_completed', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'summary', 'created_at', 'author', 'units', 'is_active']
        extra_kwargs = {'author': {'read_only': True}}