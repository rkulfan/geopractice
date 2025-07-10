from django.urls import path
from . import views

urlpatterns = [
    path('player/random', views.get_random_player),
    path('flag/random', views.get_random_flag),
]
