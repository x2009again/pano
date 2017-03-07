# -*- coding: utf-8 -*-
# from django.core.management import call_command
import os

import re
from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = u'文件重命名'

    def add_arguments(self, parser):
        parser.add_argument(
            '--path',
            default=None,
            help=u'文件夹路径',
        )

        parser.add_argument(
            '--input',
            default=None,
            help=u'匹配文件',
        )

        parser.add_argument(
            '--output',
            default=None,
            help=u'输出文件',
        )

    def handle(self, *args, **options):
        folder = options['path']
        input_reg = options['input']
        output_reg = options['output']
        print folder, input_reg, output_reg
        file_list = os.listdir(folder)
        file_list.sort(fort_func)
        i = 0
        for f in file_list:
            if os.path.isfile(os.path.join(folder, f)):
                i += 1
                new_name = '25_' + str(i) + os.path.splitext(f)[1]
                os.rename(os.path.join(folder, f), os.path.join(folder, new_name))
                print f, '--done'
        self.stdout.write(self.style.SUCCESS('complete.'))


def fort_func(x, y):
    int_x = int(re.search(r'\((\d+)\)', x).group(1))
    int_y = int(re.search(r'\((\d+)\)', y).group(1))
    if int_x > int_y:
        return 1
    elif int_x < int_y:
        return -1
    else:
        return 0
