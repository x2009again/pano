# -*- coding: utf-8 -*-
import django
import platform
from django.shortcuts import render


def index(request):
    print platform.python_version(), django.get_version()
    return render(request, 'root/home.html', {
        'python_ver': platform.python_version(),
        'django_ver': django.get_version()
    })
