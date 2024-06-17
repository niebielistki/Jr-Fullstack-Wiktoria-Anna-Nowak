import os
import csv
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import connection
from .celery import app

@csrf_exempt
def upload_file(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        file_path = os.path.join(settings.MEDIA_ROOT, file.name)
        if os.path.exists(file_path):
            return JsonResponse({'error': 'File already exists'}, status=400)
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        # Read the newly uploaded file's content
        with open(file_path, 'r') as f:
            data = f.read().splitlines()
            reader = csv.DictReader(data)
            result = [row for row in reader]
        return JsonResponse({'message': 'File uploaded successfully', 'data': result}, status=200)
    return JsonResponse({'error': 'Invalid request'}, status=400)

def list_files(request):
    files = os.listdir(settings.MEDIA_ROOT)
    return JsonResponse(files, safe=False)

def get_file_content(request, filename):
    file_path = os.path.join(settings.MEDIA_ROOT, filename)
    if not os.path.exists(file_path):
        return JsonResponse({'error': 'File not found'}, status=404)

    with open(file_path, 'r') as file:
        data = file.read().splitlines()
        reader = csv.DictReader(data)
        result = [row for row in reader]
    return JsonResponse(result, safe=False)

def healthcheck(request):
    status = {}
    try:
        tables = connection.introspection.table_names()
        status["DB"] = f"ok, tables: {', '.join(tables)}"
    except Exception as e:
        status["DB"] = f"error, {e}"

    try:
        celery_status = app.control.broadcast('ping', reply=True, limit=1)
        tasks = list(app.control.inspect().registered_tasks().values())[0]
        status["CELERY"] = f"ok, tasks: {', '.join(tasks)}" if celery_status else "error"
    except Exception as e:
        status["CELERY"] = f"error, {e}"

    return HttpResponse(json.dumps(status), content_type='application/json')
