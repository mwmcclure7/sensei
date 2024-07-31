from django.urls import path
from chat.views import *

urlpatterns = [
    path('create-chat/', ChatListCreate.as_view(), name='create-chat'),
    path('disable-chat/', ChatDisable.as_view(), name='disable-chat'),
    path('create-message/', CreateMessageView.as_view(), name='create-message')
]