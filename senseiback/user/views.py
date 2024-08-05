from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import *
from user.tokens import account_activation_token
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.contrib.auth.tokens import default_token_generator
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.core import signing
import os

User = get_user_model()


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        token = account_activation_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        link = f'http://{os.getenv("HOST_IP")}:{os.getenv("DJANGO_PORT")}/api/activate/{uid}/{token}'
        subject = 'Activate Your Sensei Account'
        message = f'''Welcome to SoftwareSensei!

Please click on the link below to activate your account:
{link}

If you did not create an account, please ignore this email.

Thanks for joining,
The SoftwareSensei Team
'''
        send_mail(subject, message, os.getenv("EMAIL_HOST_USER"), [user.email], fail_silently=False)    

class SendActivationEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            token = account_activation_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            link = f'http://{os.getenv("HOST_IP")}:{os.getenv("DJANGO_PORT")}/api/activate/{uid}/{token}'
            subject = 'Activate Your Sensei Account'
            message = f'''Welcome to SoftwareSensei!

Please click on the link below to activate your account:
{link}

If you did not create an account, please ignore this email.

Thanks for joining,
The SoftwareSensei Team
'''
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
        return redirect(f'http://{os.getenv("HOST_IP")}:{os.getenv("REACT_PORT")}/login')
    else:
        return redirect(f'http://{os.getenv("HOST_IP")}:{os.getenv("REACT_PORT")}/invalid-link')


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
            link = f'http://{os.getenv("HOST_IP")}:{os.getenv("REACT_PORT")}/reset-password/{uid}/{token}/'
            

            send_mail(
                'Password Reset Request',
                f'Click on the link below to reset your password:\n{link}',
                os.getenv("EMAIL_HOST_USER"),
                [email],
                fail_silently=False
            )
            return Response({'status': 'success', 'message': 'If an account with that email exists, we have sent an email with further instructions.'})
        return Response({'status': 'fail', 'error': 'No account with that email exists.'}, status=400)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(request.data.get('password'))
            user.save()
            return Response({'status': 'success', 'message': 'Your password has been reset.'})
        return Response({'status': 'error', 'message': 'Invalid token or user ID'}, status=400)


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.date_of_birth = data.get('date_of_birth', user.date_of_birth)
        user.info = data.get('info', user.info)
        user.save()
        return Response({'status': 'success', 'message': 'Profile updated.'})


class GetProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_of_birth': user.date_of_birth,
            'info': user.info,
            'email': user.email
        })

class RequestEmailResetEmail(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('email')
        user = request.user
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        signed_email = signing.dumps(new_email)
        link = f'http://{os.getenv("HOST_IP")}:{os.getenv("DJANGO_PORT")}/api/reset-email/{uid}/{token}/?email={signed_email}'
        send_mail(
            'Email Update Request',
            f'Click on the link below to update your email:\n{link}',
            os.getenv("EMAIL_HOST_USER"),
            [new_email],
            fail_silently=False
        )
        return Response({'status': 'success', 'message': 'If an account with that email exists, we have sent an email with further instructions.'})

def update_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and default_token_generator.check_token(user, token):
        signed_email = request.GET.get('email')
        try:
            new_email = signing.loads(signed_email)
        except signing.BadSignature:
            return redirect(f'http://{os.getenv("HOST_IP")}:{os.getenv("REACT_PORT")}/invalid-link')
        user.email = new_email
        user.save()
        return redirect(f'http://{os.getenv("HOST_IP")}:{os.getenv("REACT_PORT")}/email-updated')
    else:
        return redirect(f'http://{os.getenv("HOST_IP")}:{os.getenv("REACT_PORT")}/invalid-link')

class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.set_password(request.data.get('password'))
        user.save()
        return Response({'status': 'success', 'message': 'Password updated.'})
    