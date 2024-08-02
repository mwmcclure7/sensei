from django.urls import path
from chat.views import *

urlpatterns = [
    path('chats/', ChatListCreate.as_view(), name='create-chat'),
    path('disable-chat/', ChatDisable.as_view(), name='disable-chat'),
    path('create-message/', CreateMessageView.as_view(), name='create-message'),
    path('test/', Test.as_view(), name='test')
]