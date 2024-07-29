from django.urls import path
from chat.views import *

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
]