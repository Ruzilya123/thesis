from django.contrib import admin
from django.urls import include, path

from shop.home import home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('shop.urls')),
]
