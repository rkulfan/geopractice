from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os
import json
import random

# Load data on startup
DATA_DIR = os.path.join(settings.BASE_DIR, 'data')

with open(os.path.join(DATA_DIR, 'players.json'), encoding='utf-8') as f:
    players = json.load(f)

with open(os.path.join(DATA_DIR, 'flags.json'), encoding='utf-8') as f:
    flags = json.load(f)

flag_map = {
    category: {flag_code: [v] if isinstance(v, str) else v for flag_code, v in flag_codes.items()}
    for category, flag_codes in flags.items()
}

@api_view(['GET'])
def get_random_player(request):
    if not players:
        return Response({'error': 'Player list not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(random.choice(players))

@api_view(['GET'])
def get_random_flag(request):
    category = request.GET.get('category') or 'countries'
    if not flag_map:
        return Response({'error': 'Flag map not found'}, status=status.HTTP_404_NOT_FOUND)

    if category == 'all':
        all_entries = [
            (code, names)
            for cat_map in flag_map.values()
            for code, names in cat_map.items()
        ]
        if all_entries:
            code, names = random.choice(all_entries)
            return Response({'code': code, 'name': names})
    else:
        cat_map = flag_map.get(category)
        if cat_map:
            code, names = random.choice(list(cat_map.items()))
            return Response({'code': code, 'name': names})

    return Response({'error': 'Bad flag request'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_flags(request):
    category = request.GET.get('category') or 'countries'
    if not flag_map:
        return Response({'error': 'Flag map not found'}, status=status.HTTP_404_NOT_FOUND)

    if category == 'all':
        all_entries = [
            {'code': code, 'name': names}
            for cat_map in flag_map.values()
            for code, names in cat_map.items()
        ]
        return Response(all_entries)
    else:
        cat_map = flag_map.get(category)
        if cat_map:
            entries = [{'code': code, 'name': names} for code, names in cat_map.items()]
            return Response(entries)

    return Response({'error': 'Bad flag request'}, status=status.HTTP_400_BAD_REQUEST)