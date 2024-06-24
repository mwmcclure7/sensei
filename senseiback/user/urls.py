from django.urls import path
from . import views

urlpatterns = [
    path('api/signin', views.signin, name='signin'),
    path('api/signup', views.signup, name='signup'),
    path('api/verify-email', views.verify_email, name='verify_email'),
]