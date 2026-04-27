from django.urls import path
from .views import STKPushView, MpesaCallbackView

urlpatterns = [
    path('payments/stk-push/', STKPushView.as_view(), name='stk-push'),
    path('payments/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
