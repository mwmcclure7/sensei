from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

@csrf_exempt
def register(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        if first_name and last_name and email and password:
            user = User.objects.create_user(first_name=first_name, last_name=last_name, email=email, password=password)
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'fail', 'error': 'Missing required fields'})

