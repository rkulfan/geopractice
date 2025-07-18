from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

class PlayerEndpointTests(TestCase):
    """
    Tests for the hockey player API endpoints:
    - /player/random

    Covers normal behavior and edge cases with mocked data
    """
    def setUp(self):
        self.client = APIClient()

    # ----- Normal behavior -----
    def test_get_random_player(self):
        response = self.client.get(reverse('get_random_player'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('native', response.json())

    # ----- Edge cases with mocks -----
    @patch('api.views.players', [])
    def test_get_random_player_with_empty_list(self):
        response = self.client.get(reverse('get_random_player'))
        print(response)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), {'error': 'Player list not found'})