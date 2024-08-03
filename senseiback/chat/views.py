from django.contrib.auth import get_user_model
from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from rest_framework import generics

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
        chat_id = self.request.query_params.get('chat_id')
        return Message.objects.filter(chat_id=chat_id, chat__is_active=True, chat__author=self.request.user).order_by('created_at')

    def post(self, request):
        chat = Chat.objects.get(id=request.data.get('chat_id'))
        if (chat.is_active == False):
            return Response({'status': 'error', 'message': 'This chat has been disabled.'})
        user = request.user
        if (chat.author != user):
            return Response({'status': 'error', 'message': 'You are not authorized to send messages to this chat.'})
        user_content = request.data.get('message')
        response = "This is a test response."
        Message.objects.create(chat=chat, user_content=user_content, bot_content=response)
        return Response({'status': 'success', 'message': response})

        # message = request.data.get('message')
        # openai = OpenAI(api_key='sk-proj-IZvL2kVdds65RCNyw1zAT3BlbkFJTHIwhbGKyCpkQ8WrRNtQ')
        # completion = openai.chat.completions.create(
        #     model='gpt-4o-mini',
        #     messages=[
        #         {'role': 'system', 'content': 'You are a helpful assistant.'},
        #         {'role': 'user', 'content': message}
        #     ]
        # )
        # return Response({'status': 'success', 'message': completion.choices[0].message.content})

class Test(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({'message': 'This is a test response. Here is some more test text. This is a test response. Here is some more test text. This is a test response. Here is some more test text. This is a test response. Here is some more test text. This is a test response. Here is some more test text.'})