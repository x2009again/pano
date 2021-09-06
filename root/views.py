# -*- coding: utf-8 -*-
import django
import platform
from django.shortcuts import render, redirect
from panorama.models import *
from django.contrib import auth,messages
from django.urls import reverse


def index(request):
    print platform.python_version(), django.get_version()
    scene_list = Scene.objects.all()

    return render(request, 'root/home.html', {
        'python_ver': platform.python_version(),
        'django_ver': django.get_version(),
        'scene_list':scene_list
    })

def login(request):
    username = password = ''
    if request.POST:
        username = request.POST.get('username')
        password = request.POST.get('password')
        next = request.POST.get('next')

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                auth.login(request, user)
                # messages.info(request,"登录成功.")
                if next:
                    return redirect(next)
                else:
                    return redirect('/')
            else:
                # messages.error(request,"此账号没有激活，请联系管理员!")
                return render(request, 'login.html',{'data':"此账号没有激活，请联系管理员!"})
        else:
            return render(request, 'login.html',{'data':"账号或者密码错误!"})
    else:
        return render(request, 'login.html',{'next':request.GET.get("next")})


def logout(request):
    if request.method == 'POST':
        auth.logout(request)
        messages.success(request, '退出成功')
        return redirect('login')



