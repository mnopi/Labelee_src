import datetime
from django.db.models import Q
from django.http import HttpResponse
import simplejson
from dashboard.models import Qr_shot
from log.logger import Logger
from map_editor.api.resources import *
from map_editor.api_2.resources.point import readOnlyPois
from map_editor.api_2.utils.label_category import read_only_valid_for_enclosure

from map_editor.models import Point

from utils.helpers import queryset_to_dict, t_obj_to_dict
from django.core.cache import cache


def get_map_data(qr_type, poi_id, poisByFloor, enclosure_id):
    """
    Devuelve un diccionario con todos los datos necesarios a usar por el JS
    """
    response = {}
    qrPoint = Point.objects.select_related('floor', 'floor__enclosure', 'floor__enclosure__floors').get(pk=poi_id)
    response['qrPoint'] = {
        'point': t_obj_to_dict(PointResource(), qrPoint),
        'floor': t_obj_to_dict(FloorResource(), qrPoint.floor),
        'enclosure': t_obj_to_dict(EnclosureResource(), qrPoint.floor.enclosure),
        'label': t_obj_to_dict(LabelResource(), qrPoint.label),
        'labelCategory': queryset_to_dict([qrPoint.label.category])[0],

    }
    response['qrPoint']['isParking'] = qrPoint.label.category.name_en == FIXED_CATEGORIES[3]
    response['label_categories'] = queryset_to_dict(read_only_valid_for_enclosure(qrPoint.floor.enclosure.pk))
    response['floors'] = queryset_to_dict(qrPoint.floor.enclosure.floors.all().order_by('-floor_number'))
    for floor in response['floors']:
        floor['pois'] = poisByFloor[floor['id']]

    return response


def cache_show_map(enclosure_id):
    """
    Cachea el recinto dado para mostrar su mapa y devuelve lo almacenado
    """
    poisByFloor = {}
    categories = {}
    colors = {}
    coupons = {}
    cache_key = 'show_map_enclosure_' + enclosure_id
    cache_time = 43200
    cacheEnclosure = cache.get(cache_key)
    if not cacheEnclosure:
        points = Point.objects.select_related('label', 'label__category', 'floor', 'coupon') \
            .filter(~Q(label__category__name_en=FIXED_CATEGORIES.values()[0]),
                    floor__enclosure__id=enclosure_id) \
            .order_by('label__category__name', 'description', 'label__name')

        for point in points:
            poi = queryset_to_dict([point])[0]
            if point.floor.id in poisByFloor:
                poisByFloor[point.floor.id].append(poi)
            else:
                poisByFloor[point.floor.id] = [poi]
            poiIndex = poisByFloor[point.floor.id].index(poi)
            poisByFloor[point.floor.id][poiIndex]['label'] = queryset_to_dict([point.label])[0]
            poisByFloor[point.floor.id][poiIndex]['label']['category'] = queryset_to_dict([point.label.category])[0]

            if point.label.category.name_en not in FIXED_CATEGORIES.values():
                if point.label.category.name in categories:
                    categories[point.label.category.name].append(point)
                else:
                    colors[point.label.category.name] = point.label.category.color
                    categories[point.label.category.name] = [point]

            if point.coupon.name is not None:
                try:
                    if point.coupon.name != "":
                        coupons[point.id] = point.coupon.url
                except Exception as ex:
                    pass

        categories_list = []  # [{'name': 'toilets', 'items': [...]}, ...]
        for key, value in categories.iteritems():
            d = {
                'name': key,
                'items': value
            }
            categories_list.append(d)

        from operator import itemgetter

        ordered_categories = sorted(categories_list, key=itemgetter('name'))

        enclosure = Enclosure.objects.filter(id=enclosure_id)
        cacheEnclosure = {
            'poisByFloor': poisByFloor,
            'ordered_categories': ordered_categories,
            'colors': colors,
            'coupons': coupons,
            'enclosure':enclosure
        }
        cache.set(cache_key,cacheEnclosure,cache_time)
    else:
        poisByFloor = cacheEnclosure['poisByFloor']
        ordered_categories = cacheEnclosure['ordered_categories']
        colors = cacheEnclosure['colors']
        coupons = cacheEnclosure['coupons']
        enclosure = cacheEnclosure['enclosure']

    return {
        'poisByFloor': poisByFloor,
        'ordered_categories': ordered_categories,
        'colors': colors,
        'coupons': coupons,
        'enclosure': enclosure,
    }


def saveQrShot(poi_id):
    try:
        qrShot = Qr_shot()
        qrShot.point_id = poi_id
        qrShot.date = datetime.datetime.utcnow()
        qrShot.save()
    except Exception as ex:
        Logger.error(ex.message)