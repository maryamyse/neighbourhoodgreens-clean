from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from .mpesa_service import MpesaService
from .models import Payment
from orders.models import Order
import logging

logger = logging.getLogger(__name__)

class STKPushView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        phone_number = request.data.get('phone')
        order_id = request.data.get('order_id')
        
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if str(phone_number).startswith('0'):
            phone_number = '254' + phone_number[1:]
            
        mpesa = MpesaService()
        
        try:
            response = mpesa.process_stk_push(
                phone_number=phone_number,
                amount=int(order.total_amount),
                reference=f'ORD-{order.id}'
            )
            
            if response.get('ResponseCode') == '0':
                Payment.objects.create(
                    order=order,
                    user=request.user,
                    amount=order.total_amount,
                    phone_number=phone_number,
                    merchant_request_id=response.get('MerchantRequestID'),
                    checkout_request_id=response.get('CheckoutRequestID'),
                    status='pending'
                )
                return Response(response, status=status.HTTP_200_OK)
            else:
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MpesaCallbackView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            data = request.data
            callback_data = data.get('Body', {}).get('stkCallback', {})
            
            result_code = callback_data.get('ResultCode')
            checkout_request_id = callback_data.get('CheckoutRequestID')
            
            try:
                payment = Payment.objects.get(checkout_request_id=checkout_request_id)
            except Payment.DoesNotExist:
                logger.error(f'Payment with checkout ID {checkout_request_id} not found.')
                return Response({"ResultCode": 0, "ResultDesc": "Accepted"})

            with transaction.atomic():
                if result_code == 0:
                    callback_metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])
                    receipt_number = next((item.get('Value') for item in callback_metadata if item.get('Name') == 'MpesaReceiptNumber'), None)
                    
                    payment.status = 'completed'
                    payment.mpesa_receipt_number = receipt_number
                    payment.save()
                    
                    payment.order.status = 'completed'
                    payment.order.save()
                else:
                    payment.status = 'failed'
                    payment.save()
                    
                    payment.order.status = 'failed'
                    payment.order.save()
                    
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
            
        except Exception as e:
            logger.error(f'M-Pesa callback exception: {str(e)}')
            return Response({"ResultCode": 0, "ResultDesc": "Accepted"})
