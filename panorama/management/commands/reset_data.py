from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = '初始化/重置 数据库'

    def add_arguments(self, parser):
        parser.add_argument('drop', nargs='?')

    def handle(self, *args, **options):
        print(options)
        # if options['drop'] == '1':
        #     with connection.cursor() as cursor:
        #         cursor.execute('DROP DATABASE IF EXISTS panorama')
        #         self.stdout.write(self.style.SUCCESS('DROP ok'))
        #     with connection.cursor() as cursor:
        #         cursor.execute('CREATE DATABASE panorama')
        #         self.stdout.write(self.style.SUCCESS('CREATE ok'))
        #     with connection.cursor() as cursor:
        #         call_command('migrate')
        #         self.stdout.write(self.style.SUCCESS('migrate ok'))
        #     with connection.cursor() as cursor:
        #         call_command('loaddata init_panorama.json')
        #         self.stdout.write(self.style.SUCCESS('loaddata ok'))
        # else:
        #     call_command('loaddata', 'init_panorama.json')
        #     self.stdout.write(self.style.SUCCESS('loaddata ok'))

        self.stdout.write(self.style.SUCCESS('done.'))
