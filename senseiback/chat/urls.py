from django.urls import path
from chat.views import *
from chat.course_views import CourseListCreate, CourseDetail, UnitList, UnitDetail, UnitComplete, UnitContent

urlpatterns = [
    # Chat URLs
    path('chats/', ChatListCreate.as_view(), name='chats'),
    path('disable-chat/', ChatDisable.as_view(), name='disable-chat'),
    path('messages/', MessageListCreate.as_view(), name='messages'),
    
    # Course URLs
    path('courses/', CourseListCreate.as_view(), name='courses'),
    path('courses/<int:pk>/', CourseDetail.as_view(), name='course-detail'),
    path('units/', UnitList.as_view(), name='units'),
    path('units/<int:pk>/', UnitDetail.as_view(), name='unit-detail'),
    path('units/<int:pk>/complete/', UnitComplete.as_view(), name='unit-complete'),
    path('units/<int:pk>/content/', UnitContent.as_view(), name='unit-content'),
]