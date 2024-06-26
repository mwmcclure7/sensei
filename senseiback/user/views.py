from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer, UserLoginSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from user.tokens import account_activation_token
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.shortcuts import redirect
from django.http import HttpResponse


class SignInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None and user.userprofile.is_activated:
                return Response({'status': 'success'})
            else:
                return Response({'status': 'fail', 'error': 'Invalid credentials.'}, status=400)
        return Response(serializer.errors, status=400)
    

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'status': 'success'})
        return Response(serializer.errors, status=400)
    
def send_activation_email(user, request):
    token = account_activation_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    link = request.build_absolute_uri(reverse('activate', kwargs={'uidb64': uid, 'token': token}))
    subject = 'Activate Your Sensei Account'
    message = f'Hi {user.first_name},\n\nPlease click on the link below to activate your account:\n{link}'
    send_mail(subject, message, 'from@example.com', [user.email])    

def activate(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
        user = None
    
    if user is not None and account_activation_token.check_token(user, token):
        user.userprofile.is_activated = True
        user.save()
        return redirect('/signin')
    else:
        return HttpResponse('Activation link is invalid.')


class SignOutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'status': 'success', 'message': 'You have been signed out.'})


class DeactivateAccountView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_profile = request.user.userprofile
        user_profile.is_activated = False
        user_profile.save()
        return Response({"status": "success", "message": "Your account has been deactivated."}, status=200)
    