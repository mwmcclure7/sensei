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
        else:
            print(serializer.errors)


class ChatDisable(generics.UpdateAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(author=self.request.user, is_active=True)

    def post(self, request):
        chat = Chat.objects.get(id=request.data.get('id'))
        chat.is_active = False
        chat.save()
        return Response({'status': 'success'})


class CreateMessageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        chat = Chat.objects.get(id=request.data.get('id'))
        user_content = request.data.get('message')
        response = "This is a test response."
        Message.objects.create(chat=chat, user_content=user_content, bot_content=response)


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
        return Response({'status': 'success', 'message': response})

class Test(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({'message': 'This is a test response. Here is some more test text. This is a test response. Here is some more test text. This is a test response. Here is some more test text. This is a test response. Here is some more test text. This is a test response. Here is some more test text.'})