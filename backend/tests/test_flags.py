from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch

class FlagEndpointTests(TestCase):
    """
    Tests for the flag API endpoints:
    - /flag/random
    - /flag/all

    Covers normal behavior, defaults, invalid inputs, and edge cases with mocked data
    """
    def setUp(self):
        self.client = APIClient()

    # ----- Normal behavior -----
    def test_get_random_flag_from_category(self):
        response = self.client.get(reverse('get_random_flag'), {'category': 'countries'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('code', data)
        self.assertIn('name', data)

    def test_get_random_flag_from_all_category(self):
        response = self.client.get(reverse('get_random_flag'), {'category': 'all'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('code', data)
        self.assertIn('name', data)

    def test_get_all_flags_from_category(self):
        response = self.client.get(reverse('get_all_flags'), {'category': 'countries'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_get_all_flags_from_all_category(self):
        response = self.client.get(reverse('get_all_flags'), {'category': 'all'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
    
    # ----- Defaults -----
    def test_get_random_flag_missing_category_param(self):
        response = self.client.get(reverse('get_random_flag'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('code', response.json())

    def test_get_all_flags_missing_category_param(self):
        response = self.client.get(reverse('get_all_flags'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)

    # ----- Invalid inputs -----
    def test_invalid_category_random(self):
        response = self.client.get(reverse('get_random_flag'), {'category': 'blank'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {'error': 'Bad flag request'})
        
    def test_invalid_category_all(self):
        response = self.client.get(reverse('get_all_flags'), {'category': 'blank'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {'error': 'Bad flag request'})

    # ----- Edge cases with mocks -----
    @patch('api.views.flag_map', {})
    def test_get_random_flag_with_empty_flag_map(self):
        response = self.client.get(reverse('get_random_flag'), {'category': 'all'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), {'error': 'Flag map not found'})

    @patch('api.views.flag_map', {})
    def test_get_all_flags_with_empty_flag_map(self):
        response = self.client.get(reverse('get_all_flags'), {'category': 'all'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json(), {'error': 'Flag map not found'})

    @patch('api.views.flag_map', {
        'countries': {
            'us': ['United States'],
            'ca': ['Canada']
        }
    })
    def test_get_random_flag_from_mocked_map(self):
        response = self.client.get(reverse('get_random_flag'), {'category': 'countries'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn(data['code'], ['us', 'ca'])