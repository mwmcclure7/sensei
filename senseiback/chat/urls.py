from django.urls import path
from chat.views import *

urlpatterns = [
    path('chats/', ChatListCreate.as_view(), name='chats'),
    path('disable-chat/', ChatDisable.as_view(), name='disable-chat'),
    path('messages/', MessageListCreate.as_view(), name='messages'),
]