from django.contrib.auth import get_user_model
from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

User = get_user_model()


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        message = request.data.get('message')
        openai = OpenAI(api_key='sk-proj-IZvL2kVdds65RCNyw1zAT3BlbkFJTHIwhbGKyCpkQ8WrRNtQ')
        completion = openai.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {'role': 'system', 'content': 'You are a helpful assistant.'},
                {'role': 'user', 'content': message}
            ]
        )
        return Response({'status': 'success', 'message': completion.choices[0].message['content']})
