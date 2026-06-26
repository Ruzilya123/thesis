from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    AddressViewSet,
    AdminOrderViewSet,
    CategoryListView,
    DeliveryMethodListView,
    GrindTypeListView,
    LoyaltyView,
    OrderCalculateView,
    OrderViewSet,
    ProductViewSet,
    ProfileView,
    PromoValidateView,
    RegisterView,
    RoastLevelListView,
)

router = DefaultRouter()
router.register('products', ProductViewSet, basename='products')
router.register('orders', OrderViewSet, basename='orders')
router.register('addresses', AddressViewSet, basename='addresses')
router.register('admin/orders', AdminOrderViewSet, basename='admin-orders')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('roasts/', RoastLevelListView.as_view(), name='roasts'),
    path('grinds/', GrindTypeListView.as_view(), name='grinds'),
    path('delivery-methods/', DeliveryMethodListView.as_view(), name='delivery-methods'),
    path('promo/validate/', PromoValidateView.as_view(), name='promo-validate'),
    path('orders/calculate/', OrderCalculateView.as_view(), name='order-calculate'),
    path('loyalty/', LoyaltyView.as_view(), name='loyalty'),
    path('', include(router.urls)),
]
