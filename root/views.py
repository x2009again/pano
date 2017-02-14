# -*- coding: utf-8 -*-
import os
import django
from django.http import HttpResponse
from django.db import connection
from settings import BASE_DIR


def index(request):
    return HttpResponse(
        'django version: {0} <br/><br/>'
        '<a href="/panorama/view?scene_id=first">查看场景first</a><br/>'
        '<a href="/panorama/edit?scene_id=first">编辑场景first</a><br/>'
        '<a href="/panorama/view?scene_id=second">查看场景second</a><br/>'
        '<a href="/panorama/edit?scene_id=second">编辑场景second</a><br/>'
        '<br/><br/><a href="/static/f22fight.html">3D场景</a>'.format(django.get_version())
    )


def init_database(request):
    """
    将数据重置
    :param request:
    :return:
    """
    file_path = os.path.join(BASE_DIR, 'panorama/fixtures/panorama.sql'),
    print file_path[0]
    sql = open(file_path[0], 'r').read()
    cursor = connection.cursor()
    cursor.execute(sql)
    return HttpResponse("reset database succeed!")
