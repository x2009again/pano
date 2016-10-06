import json
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from panorama.models import *


def index(request):
    return HttpResponse(
        "<a href='/panorama/view?scene_id=first'>查看场景first</a>"
        "<br/>"
        "<a href='/panorama/edit?scene_id=first'>编辑场景first</a>"
    )


def view(request):
    return render(request, 'panorama/view.html')


def edit(request):
    return render(request, 'panorama/edit.html')


def init_scene(request):
    seller = Seller.objects.get(pk=1)  # 假设登录用户id为1
    scene_id = request.GET.get('scene_id')
    scene_filter = Scene.objects.filter(pk=scene_id)
    if not scene_id or not scene_filter.exists():
        return JsonResponse({'success': False, 'err_msg': '不存在编号为%s的场景' % scene_id})
    scene = scene_filter[0]
    spaces_of_scene = SceneSpace.objects.filter(scene=scene).order_by('ordinal')
    space_list = []
    for ss in spaces_of_scene:
        space = ss.space
        hots = []
        hot_filter = Hot.objects.filter(scene_space=ss)
        if hot_filter.exists():
            for h in hot_filter:
                vector = json.loads(h.vector) if h.vector else {}
                transition = json.loads(h.transition) if h.transition else {}
                hots.append(dict(vector, **transition, title=h.title))
        space_list.append({
            'id': space.id,
            'name': ss.space_name if ss.space_name else space.name,
            'url': space.url,
            'cache_url': space.cache_url,
            'thumb_url': space.thumb_url,
            'hots': hots,
            'create_time': timezone.localtime(space.create_time)
        })

    return JsonResponse({
        'success': True,
        'scene': {
            'id': scene.id,
            'title': scene.title,
            'entry': scene.entry.id

        },
        'seller': {
            'id': seller.id,
            'name': seller.name,
            'logo': seller.logo,
            'phone': seller.phone,
            'address': seller.address,
            'desc': seller.desc,

        },
        'spaceList': space_list

    }, safe=False)


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
                'url': space.url,
                'thumb_url': space.thumb_url,
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
    scene_filter = Scene.objects.filter(pk=scene_id)
    if not ordered_spaces or not scene_filter.exists():
        return JsonResponse({'success': False})
    scene = scene_filter[0]
    entry_id = scene.entry_id
    SceneSpace.objects.filter(scene=scene).delete()
    ordered_spaces = json.loads(ordered_spaces)
    ordinal = 1
    for os in ordered_spaces:
        space_name = os['name']
        if not space_name:
            space_name = Space.objects.get(pk=os.id).name
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
            'err_msg': '参数错误'
        })
    hot = Hot(
        scene_space=ss_filter[0],
        title=title,
        vector=json.dumps({'vx': vx, 'vy': vy, 'vz': vz}),
        transition=json.dumps({'to': to})
    )
    hot.save()
    return JsonResponse({
        'success': True,
        'hotID': hot.id
    })


def init_data(request):
    # TODO 初始化化数据
    sellers = Seller.objects.all()
    print(sellers.count())
    return HttpResponse("success.")
