# -*- coding: utf-8 -*-
import os
import django
from django.http import HttpResponse
from django.db import connection
from settings import BASE_DIR


def index(request):
    return HttpResponse(
        '<a href="/panorama/view?scene_id=first">查看场景first</a><br/>'
        '<a href="/panorama/edit?scene_id=first">编辑场景first</a><br/>'
        '<a href="/panorama/view?scene_id=second">查看场景second</a><br/>'
        '<a href="/panorama/edit?scene_id=second">编辑场景second</a><br/>'
    )
