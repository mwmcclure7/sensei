from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from .serializers import *
from user.tokens import account_activation_token
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.http import HttpResponse
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken

# Tutorial imports start here
from django.shortcuts import render
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail

User = get_user_model()


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        link = f'http://localhost:8000/api/activate/{uid}/{token}'
        subject = 'Activate Your Sensei Account'
        message = f'Welcome to SoftwareSensei!\n\nPlease click on the link below to activate your account:\n{link}'
        send_mail(subject, message, 'mwmcclure7@gmail.com', [user.email], fail_silently=False)


class SendActivationEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            token = account_activation_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            link = f'http://localhost:8000/api/activate/{uid}/{token}'
            subject = 'Activate Your Sensei Account'
            message = f'Welcome to SoftwareSensei!\n\nPlease click on the link below to activate your account:\n{link}'
            send_mail(subject, message, 'mwmcclure7@gmail.com', [email], fail_silently=False)
            return Response({'status': 'success', 'message': 'Activation email has been sent.'})
        return Response({'status': 'fail', 'error': 'No account with that email exists.'}, status=400)
    

def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        return redirect('http://localhost:5173/login')
    else:
        return redirect('http://localhost:5173/invalid-activation')


class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_active = False
        i = 1
        while True:
            email = f'(deactivated_{i}){user.email}'
            if User.objects.filter(email=email).exists():
                i += 1
            else:
                user.email = email
                break
        user.save()
        return Response({'status': 'success', 'message': 'Your account has been deactivated.'})


class RequestPasswordResetEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            link = f'http://localhost:5173/api/reset-password/{uid}/{token}'
            send_mail(
                'Password reset Request',
                f'Click on the link below to reset your password:\n{link}',
                'mwmcclure7@gmail.com',
                [email],
                fail_silently=False
            )
            return Response({'status': 'success', 'message': 'If an account with that email exists, we have sent an email with further instructions.'})
        return Response({'status': 'fail', 'error': 'No account with that email exists.'}, status=400)


class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            serializer = ResetPasswordSerializer(data=request.data)
            if serializer.is_valid():
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({'status': 'success', 'message': 'Your password has been reset.'})
            return Response(serializer.errors, status=400)
        return Response({'status': 'error', 'message': 'Invalid token or user ID'}, status=400)
