# -*- coding: utf-8 -*-
import datetime
from django.contrib.auth.decorators import login_required
from django.core.serializers import json
from django.http import HttpResponse

from django.shortcuts import render_to_response
from django.template import RequestContext
from django.utils import simplejson
from dashboard.models import DisplayedRoutes
from map_editor.models import Point

import settings

@login_required(login_url=settings.LOGIN_URL)
def index(request):

    # translation.activate(request.session['django_language'])

    return render_to_response('dashboard/index.html', context_instance=RequestContext(request))



@login_required(login_url=settings.LOGIN_URL)
def saveRouteRequest(request):
    json_data = request.body
    point_list = simplejson.loads(json_data)
    dispRoute =DisplayedRoutes()
    dispRoute.origin_id= point_list['originpoi']
    dispRoute.destination_id = point_list['destinationpoi']
    dispRoute.date = datetime.datetime.utcnow()
    dispRoute.save()
    return HttpResponse(json.dumps('ok'))
