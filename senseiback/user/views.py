from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from user.tokens import account_activation_token
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.http import HttpResponse
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class SignInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, email=email, password=password)
            if user is not None:
                refresh = RefreshToken.for_user(user)
                return Response({'token': str(refresh.access_token)}, status=200)
            else:
                return Response({'status': 'fail', 'error': 'Invalid credentials.'}, status=400)
        return Response(serializer.errors, status=400)
    

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = account_activation_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            link = f'http://{request.get_host()}/api/activate/{uid}/{token}'
            subject = 'Activate Your Sensei Account'
            message = f'Welcome to SoftwareSensei!\n\nPlease click on the link below to activate your account:\n{link}'
            send_mail(subject, message, 'mwmcclure7@gmail.com', [user.email], fail_silently=False)
            redirect(f'http://localhost:3000/signin')
            return Response({'status': 'success'})
        return Response(serializer.errors, status=400)
        

def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        login(user)
        return redirect(f'http://localhost:3000/account-created')
    else:
        return HttpResponse('Activation link is invalid.')


class SignOutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'status': 'success', 'message': 'You have been signed out.'})


class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_active = False
        # This loop renames the user's email to a unique "deactivated"
        # email so a new account with that same email can be created
        i = 1
        while True:
            email = f'(deactivated_{i}){user.email}'
            if User.objects.filter(email=email).exists():
                i += 1
            else:
                user.email = email
                break
        user.save()
        logout(request)
        return Response({"status": "success", "message": "Your account has been deactivated."}, status=200)


class RequestPasswordResetEmail(APIView):
    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            link = f'http://{request.get_host()}/api/reset-password/{uid}/{token}'
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
