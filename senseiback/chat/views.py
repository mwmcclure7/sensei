from django.contrib.auth import get_user_model
from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from rest_framework import generics
from .llm import generate_response

User = get_user_model()


class ChatListCreate(generics.ListCreateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(author=self.request.user, is_active=True).order_by('-created_at')

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user, title=self.request.data.get('title'))
            return Response({'id': serializer.data.get('id')})
        else:
            print(serializer.errors)


class ChatDisable(APIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        chat = Chat.objects.get(id=request.data.get('id'))
        chat.is_active = False
        chat.save()
        return Response({'status': 'success'})


class MessageListCreate(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        chat = Chat.objects.get(id=self.request.query_params.get('chat_id'))
        if (chat.is_active and chat.author == self.request.user):
            return chat.messages.all().order_by('created_at')

    def post(self, request):
        chat = Chat.objects.get(id=request.data.get('chat_id'))
        if (not chat.is_active):
            return Response({'status': 'error', 'message': 'This chat has been disabled.'})
        user = request.user
        if (chat.author != user):
            return Response({'status': 'error', 'message': 'You are not authorized to send messages to this chat.'})
        user_content = request.data.get('message')
        fun_mode = request.data.get('fun_mode')
        # OpenAI API
        response = generate_response(user_content, chat, fun_mode)

        Message.objects.create(chat=chat, user_content=user_content, bot_content=response)
        return Response({'status': 'success', 'message': response})
