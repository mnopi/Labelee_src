"""Production settings and globals."""

from common import *

# Production database
#########################################
DATABASES = {
    "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "labelee",
    "USER": "root",
    "PASSWORD": "1aragon1",
    "HOST": "",
    "PORT": "",
    }
}
##########################################

# DEBUG MODE IS OFF!!
####################################
DEBUG = False
TEMPLATE_DEBUG = DEBUG
####################################


# Only allowed hosts!!
####################################
ALLOWED_HOSTS = ['localhost:8000', '127.0.0.1', '192.168.1.33', '.compute.amazonaws.com', '.compute-1.amazonaws.com']   #TODO: dejar el que toque!
####################################


ADMINS = (
    ('Labeloncio', 'labelee_server@yahoo.com'),
)

MANAGERS = ADMINS