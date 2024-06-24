from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from senseiback import settings

@csrf_exempt
def signin(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            return redirect('/')
        else:
            return JsonResponse({'status': 'fail', 'error': 'Invalid credentials.'})
    return JsonResponse({'status': 'fail', 'error': 'Only POST requests are allowed.'})

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        if email and password:
            if User.objects.filter(email=email).exists():
                return JsonResponse({'status': 'fail', 'error': 'Email already exists'})
            else:
                user = User.objects.create_user(username=email, email=email, password=password)
                token = default_token_generator.make_token(user)
                verification_link = request.build_absolute_uri(reverse('api/verify_email')) + f"?token={token}&email={email}"

                send_mail(
                    'Verify Email',
                    f'Please click on the link to verify your email address for softwaresensei.ai:\n\n{verification_link}\n\nIf you did not sign up for an account, please ignore this email.',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return JsonResponse({'status': 'success', 'message': 'An email has been sent to {email} for verification.'})
        else:
            return JsonResponse({'status': 'fail', 'error': 'Missing required fields'})

def verify_email(request):
    token = request.GET.get('token')
    email = request.GET.get('email')
    try:
        user = User.objects.get(email=email)
        if default_token_generator.check_token(user, token):
            user.email_verified = True
            user.save()
            return redirect('/')
        else:
            return JsonResponse({'status': 'fail', 'error': 'Invalid verification link'})
    except User.DoesNotExist:
        return JsonResponse({'status': 'fail', 'error': 'User does noot exist'})