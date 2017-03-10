# -*- coding: utf-8 -*-
import os
import django
import platform
from django.http import HttpResponse
from django.db import connection
from settings import BASE_DIR


def index(request):
    return HttpResponse(
        u'django version: {1} <br/>'
        u'python version: {0} <br/><br/>'
        u'<a href="/panorama/view?scene_id=first">查看场景first</a><br/>'
        u'<a href="/panorama/edit?scene_id=first">编辑场景first</a><br/>'
        u'<a href="/panorama/view?scene_id=second">查看场景second</a><br/>'
        u'<a href="/panorama/edit?scene_id=second">编辑场景second</a><br/>'
        u'<a href="/panorama/check?space_id=24">查看空间24</a><br/>'
        u'<a href="/panorama/check?space_id=25">查看空间25</a><br/>'.format(
            platform.python_version(), django.get_version()
        )
    )
