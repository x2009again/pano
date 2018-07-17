# -*- coding: utf-8 -*-
import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render_to_response
from django.views.decorators.csrf import csrf_exempt
from panorama.models import *
from collections import OrderedDict

STATIC_PREFIX = '/pano/static/panorama/'


def test(request):
    return render_to_response('panorama/merge.html')


def view(request):
    return render_to_response('panorama/view.html')


def edit(request):
    return render_to_response('panorama/edit.html')


def check(request):
    return render_to_response('panorama/check.html')


def init_scene(request):
    space_id = request.GET.get('space_id')
    scene_id = request.GET.get('scene_id')
    space_list = []
    if scene_id:
        scene_filter = Scene.objects.filter(pk=scene_id)
        if not scene_filter.exists():
            return JsonResponse({'success': False, 'err_msg': u'不存在编号为%s的场景' % scene_id})
        scene = scene_filter[0]
        seller = scene.seller
        scene_info = {
            'id': scene.id,
            'title': scene.title,
            'entry': scene.entry.id

        }
        spaces_of_scene = SceneSpace.objects.filter(scene=scene).order_by('ordinal')
        for ss in spaces_of_scene:
            space = ss.space
            texture_group = TextureGroup.objects.filter(space=space, entry=True)
            space_url = texture_group[0].url if texture_group.exists() else space.url
            space_url = STATIC_PREFIX + space_url
            hot_info_dict = {}
            hot_filter = Hot.objects.filter(scene_space=ss)
            if hot_filter.exists():
                for h in hot_filter:
                    vector = json.loads(h.vector) if h.vector else {}
                    transition = json.loads(h.transition) if h.transition else {}
                    hot_info_dict[h.id] = dict(vector, id=h.id, title=h.title, **transition)
            space_list.append({
                'id': space.id,
                'name': ss.space_name if ss.space_name else space.name,
                'url': space_url,
                'thumb_url': space.thumb_url and (STATIC_PREFIX + space.thumb_url),
                'hotInfoDict': hot_info_dict,
                'create_time': timezone.localtime(space.create_time)
            })
    elif space_id:
        space_filter = Space.objects.filter(pk=space_id)
        if not space_filter.exists():
            return JsonResponse({'success': False, 'err_msg': u'不存在编号为%s的空间' % space_id})
        space = space_filter[0]
        seller = space.creator
        scene_info = {'entry': space.id}
        space_list.append({
            'id': space.id,
            'name': space.name,
            'url': STATIC_PREFIX + space.url,
            'thumb_url': space.thumb_url and (STATIC_PREFIX + space.thumb_url),
            'create_time': timezone.localtime(space.create_time)
        })
    else:
        return JsonResponse({'success': False, 'err_msg': u'参数错误'})

    return JsonResponse({
        'success': True,
        'scene': scene_info,
        'spaceList': space_list,
        'seller': {
            'id': seller.id,
            'name': seller.name,
            'logo': seller.logo.url if seller.logo else '/static/panorama/img/logo.png',
            'phone': seller.phone,
            'address': seller.address,
            'desc': seller.desc,
        }
    }, safe=False)


texture_dict = {}


def get_space(request):
    """
    获取单个空间数据
    :param request:
    :return:
    """
    space_id = request.GET.get('space_id')
    space_filter = Space.objects.filter(pk=space_id)
    if not space_filter.exists():
        return JsonResponse({'success': False, 'err_msg': u'不存在编号为%s的空间' % space_id})
    if not texture_dict:  # 全局变量
        for t in Texture.objects.all():
            texture_dict[t.code] = {
                'code': t.code,
                'area': t.area,
                'label': t.label,
            }
    space = space_filter[0]
    group_list = []
    url_list = []
    area2texture = {}
    textures = {}
    entry_texture = None
    entry_codes = None
    for tg in TextureGroup.objects.filter(space=space):
        if tg.entry:
            entry_texture = tg.url
            entry_codes = tg.codes
        code_group = [int(code) for code in tg.codes.split(',')]
        group_list.append(code_group)
        url_list.append(STATIC_PREFIX + tg.url)
        for code in tg.codes.split(','):
            code = int(code)
            if code and code not in textures:
                textures[code] = texture_dict[code]

    for code in textures:
        texture = textures[code]
        area_code = texture['area']
        texture_code = texture['code']
        texture_label = texture['label']
        if area_code in area2texture:
            area2texture[area_code]['textures'].append({
                'code': texture_code,
                'label': texture_label,
            })
        else:
            area2texture[area_code] = {
                'area_code': area_code,
                'area_label': Texture.AREA_CHOICES[area_code],
                'textures': [{
                    'code': texture_code,
                    'label': texture_label,
                }]
            }

    seller = space.creator
    return JsonResponse({'success': True, 'data': {
        'id': space.id,
        'name': space.name,
        'url': STATIC_PREFIX + (entry_texture or space.url),
        'entry_codes': entry_codes,
        'thumb_url': space.thumb_url and (STATIC_PREFIX + space.thumb_url),
        'create_time': timezone.localtime(space.create_time),
        'seller': {
            'id': seller.id,
            'name': seller.name,
            'logo': seller.logo.url if seller.logo else '/static/panorama/img/logo.png',
            'phone': seller.phone,
            'address': seller.address,
            'desc': seller.desc,
        },
        'area2texture': area2texture,
        'group_list': group_list,
        'url_list': url_list,
    }})


def list_spaces(request):
    """
    获取用户的所有空间历史记录
    """
    seller = Seller.objects.get(pk=1)  # 假设登录用户id为1
    space_filter = Space.objects.filter(creator=seller)
    space_dict = {}
    if space_filter.exists():
        for space in space_filter:
            space_dict[space.id] = {
                'id': space.id,
                'name': space.name,
                'url': STATIC_PREFIX + space.url,
                'thumb_url': space.thumb_url and (STATIC_PREFIX + space.thumb_url),
                'create_time': timezone.localtime(space.create_time)
            }
        return JsonResponse({
            'success': True,
            'space_dict': space_dict
        })


@csrf_exempt
def update_scene(request):
    """
    更新或创建场景
    """
    scene_id = request.POST.get('scene_id')
    ordered_spaces = request.POST.get('spaces')
    scene_title = request.POST.get('title')
    if not ordered_spaces:
        return JsonResponse({'success': False})
    ordered_spaces = json.loads(ordered_spaces)
    #  TODO 会导致热点全部消失，待改进
    if scene_id:  # 场景已存在则更新
        scene_filter = Scene.objects.filter(pk=scene_id)
        if not scene_filter.exists():
            return JsonResponse({'success': False, 'err_msg': u'不存在场景：%s' % scene_id})
        scene = scene_filter[0]
        entry_id = scene.entry_id
        SceneSpace.objects.filter(scene=scene).delete()  # 先删除已经存在的关联
        ordinal = 1
        for os in ordered_spaces:
            space_name = os['name']
            if not space_name:
                space_name = Space.objects.get(pk=os.id).name
            # 创建新的关联
            SceneSpace(scene=scene, space_id=os['id'], space_name=space_name, ordinal=ordinal).save()
            ordinal += 1
            if os['id'] == entry_id:
                entry_id = None
        if scene_title:
            scene.title = scene_title
            scene.save()
        else:
            scene_title = scene.title
        if entry_id:
            scene.entry_id = ordered_spaces[0]['id']
            scene.save()
            entry_id = scene.entry_id
        return JsonResponse({
            'success': True,
            'title': scene_title,
            'entry': entry_id
        })
    else:  # 不存在则创建
        seller = Seller.objects.get(pk=1)  # 假设登录用户id为1
        entry_id = ordered_spaces[0]['id']
        scene = Scene(seller=seller, title=scene_title, entry_id=entry_id)
        scene.save()
        ordinal = 1
        for os in ordered_spaces:
            space_name = os['name']
            if not space_name:
                space_name = Space.objects.get(pk=os.id).name
            SceneSpace(scene=scene, space_id=os['id'], space_name=space_name, ordinal=ordinal).save()
            ordinal += 1
        return JsonResponse({
            'success': True,
            'scene_id': scene.id
        })


@csrf_exempt
def add_hot(request):
    """
    添加热点
    """
    space_id = request.POST.get('space_id')
    scene_id = request.POST.get('scene_id')
    vx = request.POST.get('vx')
    vy = request.POST.get('vy')
    vz = request.POST.get('vz')
    to = request.POST.get('to')
    title = request.POST.get('title')
    ss_filter = SceneSpace.objects.filter(scene_id=scene_id, space_id=space_id)
    if not (space_id and scene_id and vx and vy and vz and to and ss_filter.exists()):
        return JsonResponse({
            'success': False,
            'err_msg': u'参数错误'
        })
    hot = Hot(
        scene_space=ss_filter[0],
        title=title,
        vector=json.dumps({'vx': float(vx), 'vy': float(vy), 'vz': float(vz)}),
        transition=json.dumps({'to': to})
    )
    hot.save()
    return JsonResponse({
        'success': True,
        'hotId': hot.id
    })


@csrf_exempt
def update_hot(request):
    """
    更新热点
    """
    hot_id = request.POST.get('id')
    title = request.POST.get('title')
    to = request.POST.get('to')
    px = request.POST.get('px')
    py = request.POST.get('py')
    pz = request.POST.get('pz')
    # rx = request.POST.get('rx')
    # ry = request.POST.get('ry')
    # rz = request.POST.get('rz')
    if not to or not hot_id:
        return JsonResponse({
            'success': False,
            'err_msg': u'参数错误'
        })
    h_filter = Hot.objects.filter(pk=hot_id)
    if not h_filter.exists():
        return JsonResponse({
            'success': False,
            'err_msg': u'没有该热点'
        })
    hot = h_filter[0]
    hot.title = title
    hot.transition = json.dumps({
        'to': to,
        'px': float(px) or 0,
        'py': float(py) or 0,
        'pz': float(pz) or 0
        # 'rx': float(rx) or 0,
        # 'ry': float(ry) or 0,
        # 'rz': float(rz) or 0
    })
    hot.save()
    return JsonResponse({'success': True})


def delete_hot(request):
    """
    删除热点
    """
    hot_id = request.GET.get('id')
    h_filter = Hot.objects.filter(pk=hot_id)
    if not hot_id or not h_filter.exists():
        return JsonResponse({
            'success': False,
            'err_msg': u'参数错误'
        })
    h_filter.delete()
    return JsonResponse({'success': True})


@csrf_exempt
def update_seller(request):
    """
    修改商户信息
    """
    cb = request.POST.get('cb')
    seller_id = request.POST.get('seller_id')
    name = request.POST.get('name')
    desc = request.POST.get('desc')
    logo = request.FILES.get('logo')
    seller_filter = Seller.objects.filter(pk=seller_id)
    if cb and (name or desc) and logo and seller_filter.exists():
        seller = seller_filter[0]
        seller.name = name
        seller.desc = desc
        seller.logo = logo
        seller.save()
        return HttpResponse(
            '<script>window.parent.%s({ success: true, seller:{name: "%s",desc: "%s",logo: "%s"}});</script>' %
            (cb, seller.name, seller.desc, seller.logo.url))
    return HttpResponse("<script>window.parent.%s({ success: false});</script>" % cb)
