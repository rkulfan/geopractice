from django.urls import path
from . import views

urlpatterns = [
    path('player/random', views.get_random_player, name='get_random_player'),
    path('flag/random', views.get_random_flag, name='get_random_flag'),
    path('flag/all', views.get_all_flags, name='get_all_flags'),
]
