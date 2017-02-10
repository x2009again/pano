# -*- coding: utf-8 -*-
import uuid
from django.db import models
from django.utils import timezone


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
    url = models.CharField(max_length=100, null=False)
    cache_url = models.CharField(max_length=100, null=True)
    thumb_url = models.CharField(max_length=100, null=True)
    creator = models.ForeignKey(Seller, verbose_name='创建者', related_name='creator_id', null=False)
    create_time = models.DateTimeField(verbose_name='创建时间', default=timezone.now)


class Scene(models.Model):
    """
    场景
    """
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid1)
    title = models.CharField(max_length=20, null=False)
    seller = models.ForeignKey(Seller, verbose_name='商户', related_name='seller_id', null=False)
    entry = models.ForeignKey(Space, verbose_name='入口空间', related_name='entry_id', null=False)


class SceneSpace(models.Model):
    """
    空间场景关联
    """
    scene = models.ForeignKey(Scene, verbose_name='场景', related_name='scene_id', null=False)
    space = models.ForeignKey(Space, verbose_name='空间', related_name='space_id', null=False)
    space_name = models.CharField(verbose_name='空间名称', max_length=20, null=True)
    ordinal = models.PositiveSmallIntegerField(verbose_name='序号', default=1)


class Hot(models.Model):
    """
    热点
    """
    scene_space = models.ForeignKey(SceneSpace, verbose_name='场景', related_name='scene_space_id', null=False)
    title = models.CharField(verbose_name='hover名称', max_length=20, null=True)
    vector = models.CharField(verbose_name='向量/位置', max_length=100, null=True)
    transition = models.CharField(verbose_name='转场动作', max_length=300, null=True)
