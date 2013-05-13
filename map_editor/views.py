# -*- coding: utf8 -*-

from django.shortcuts import render_to_response
from django.template import RequestContext

import settings


def index(request):
    ctx = {
        '_enclosure': settings.STATIC_URL + 'partials/_enclosure.html'
    }

    return render_to_response('map_editor/index.html', ctx, context_instance=RequestContext(request))


def edit(request, pk):
	#import urllib2
	#response = urllib2.urlopen('http://mnopi:1aragon1@localhost:8000/api/v1/map/' + pk)
	#html = response.read()
	ctx = {
		'floor_id': pk
	}
	return render_to_response('map_editor/edit.html', ctx, context_instance=RequestContext(request))
