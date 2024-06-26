from django.urls import path
from .views import SignInView, SignUpView, SignOutView, activate

urlpatterns = [
    path('signin/', SignInView.as_view(), name='signin'),
    path('signup/', SignUpView.as_view(), name='signup'),
    path('signout/', SignOutView.as_view(), name='signout'),
    path('activate/<uidb64>/<token>/', activate, name='activate')
]