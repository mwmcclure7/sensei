from django.urls import path
from user.views import *
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('send-activation-email/', SendActivationEmailView.as_view(), name='send-activation-email'),
    path('activate/<uidb64>/<token>/', activate, name='activate'),
    path('deactivate-account/', DeactivateAccountView.as_view(), name='deactivate-account'),
    path('request-password-reset/', RequestPasswordResetEmail.as_view(), name='request-password-reset'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('get-profile/', GetProfileView.as_view(), name='get-profile'),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
]