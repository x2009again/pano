# -*- coding: utf-8 -*-
import os
import django
from django.http import HttpResponse
from django.db import connection
from settings import BASE_DIR


def index(request):
    return HttpResponse(
        u'<a href="/panorama/view?scene_id=first">查看场景first</a><br/>'
        u'<a href="/panorama/edit?scene_id=first">编辑场景first</a><br/>'
        u'<a href="/panorama/view?scene_id=second">查看场景second</a><br/>'
        u'<a href="/panorama/edit?scene_id=second">编辑场景second</a><br/>'
        u'<a href="/panorama/check?space_id=23">查看空间23</a><br/>'
    )
