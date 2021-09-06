# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.utils import timezone
from PIL import Image
import os
from root.settings import MEDIA_ROOT
from django.db.models.fields.files import ImageFieldFile

def make_thumb(path, size = 180):
    pixbuf = Image.open(path)
    width, height = pixbuf.size

    if width > size:
        delta = width / size
        height = int(height / delta)
        pixbuf.thumbnail((size, height), Image.ANTIALIAS)
        return pixbuf

class Seller(models.Model):
    """
    商户
    """
    name = models.CharField(max_length=20, null=False)
    logo = models.ImageField(upload_to='seller-logo/')
    phone = models.CharField(max_length=20, null=True)
    address = models.CharField(max_length=100, null=True)
    desc = models.CharField(max_length=300, null=True)
    create_time = models.DateTimeField(verbose_name='创建时间', default=timezone.now)


class Space(models.Model):
    """
    空间
    """

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=20, null=False)
    url = models.ImageField(upload_to='spaces/real/', verbose_name='默认材质地址', max_length=100, null=False)
    thumb_url = models.ImageField(upload_to='spaces/thumb/',max_length=100, null=True)
    creator = models.ForeignKey(Seller, verbose_name='创建者', related_name='+', null=False)
    create_time = models.DateTimeField(verbose_name='创建时间', default=timezone.now)

    # 保存上传图片的缩略图
    def save(self):
        super(Space, self).save()  # 将上传的图片先保存一下，否则报错
        base, ext = os.path.splitext(os.path.basename(self.url.path))
        thumb_pixbuf = make_thumb(os.path.join(MEDIA_ROOT, self.url.name))
        relate_thumb_path = os.path.join('spaces/thumb', base + ext)
        thumb_path = os.path.join(MEDIA_ROOT, relate_thumb_path)
        thumb_pixbuf.save(thumb_path)
        self.thumb_url = ImageFieldFile(self, self.thumb_url, relate_thumb_path)
        super(Space, self).save() # 再保存一下，包括缩略图等


class Scene(models.Model):
    """
    场景
    """
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid1)
    title = models.CharField(verbose_name='标题', max_length=20, null=False)
    seller = models.ForeignKey(Seller, verbose_name='商户', related_name='+', null=False)
    entry = models.ForeignKey(Space, verbose_name='入口空间', related_name='+', null=False)


class SceneSpace(models.Model):
    """
    空间场景关联
    """
    scene = models.ForeignKey(Scene, verbose_name='场景', related_name='+', null=False)
    space = models.ForeignKey(Space, verbose_name='空间', related_name='+', null=False)
    space_name = models.CharField(verbose_name='空间名称', max_length=20, null=True)
    ordinal = models.PositiveSmallIntegerField(verbose_name='序号', default=1)


class Hot(models.Model):
    """
    热点
    """
    scene_space = models.ForeignKey(SceneSpace, verbose_name='场景', related_name='+', null=False)
    title = models.CharField(verbose_name='hover名称', max_length=20, null=True)
    vector = models.CharField(verbose_name='向量/位置', max_length=100, null=True)
    transition = models.CharField(verbose_name='转场动作', max_length=300, null=True)


class Texture(models.Model):
    QIANG_MIAN = 1  # 墙面
    DI_MIAN = 2  # 地面
    AREA_CHOICES = {
        QIANG_MIAN: '墙面',
        DI_MIAN: '地面',
    }
    QM_CHOICES = {
        1: '蓝色暗纹壁纸',
        2: '蓝色简欧壁纸',
        3: '蓝色条纹壁纸',
        4: '暖色壁纸',
        5: '花壁纸',
        6: '素咖色壁纸',
        7: '素蓝色壁纸',
        8: '素色壁纸',
    }
    DM_CHOICES = {
        1: '爵士白地砖',
        2: '米色地砖',
        3: '木地板',
        4: '玉石地砖',
        5: '仿古砖',
    }
    code = models.PositiveIntegerField(verbose_name='贴图编号', primary_key=True)  # 不能是0
    area = models.SmallIntegerField(
        choices=AREA_CHOICES.items(),
        null=True,
        default=None,
    )
    label = models.CharField(max_length=20, null=False)


class TextureGroup(models.Model):
    """
    空间贴图关联表
    """
    codes = models.CharField(verbose_name='贴图组合', max_length=50, null=True, default=None)  # 贴图code逗号分隔
    url = models.CharField(max_length=100, null=False)
    entry = models.BooleanField(verbose_name='是否是默认(入口)材质')
    space = models.ForeignKey(Space, verbose_name='所属空间', related_name='+', null=False)
