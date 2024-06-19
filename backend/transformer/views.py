import os
import csv
import json
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.db import connection
from .celery import app
import itertools
import datetime

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

def flatten_dict(d, parent_key='', sep='_'):
    """
    Helper function to flatten a nested dictionary.
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

@csrf_exempt
def enrich_data(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            api_endpoint = body['apiEndpoint']
            csv_key_column = body['csvKeyColumn']
            api_response_key = body['apiResponseKey']
            file_name = body['fileName']
        except KeyError:
            return JsonResponse({'error': 'Missing parameters'}, status=400)

        # Fetch external data
        try:
            external_data_response = requests.get(api_endpoint)
            external_data = external_data_response.json()
            print("External Data:", external_data)
        except requests.RequestException as e:
            return JsonResponse({'error': f'Error fetching external data: {str(e)}'}, status=400)

        # Load original CSV data
        file_path = os.path.join(settings.MEDIA_ROOT, file_name)
        if not os.path.exists(file_path):
            return JsonResponse({'error': 'Original file not found'}, status=404)

        with open(file_path, 'r') as file:
            csv_data = file.read().splitlines()
            reader = csv.DictReader(csv_data)
            csv_data = [row for row in reader]
            print("CSV Data:", csv_data)

        # Perform the join operation
        enriched_data = []
        external_data_map = {str(item[api_response_key]): item for item in external_data}
        print("External Data Map:", external_data_map)
        for row in csv_data:
            key = row[csv_key_column]
            print("Key:", key)
            if key in external_data_map:
                enriched_row = {**row, **flatten_dict(external_data_map[key])}
                print("Enriched Row:", enriched_row)
            else:
                enriched_row = row
            enriched_data.append(enriched_row)

        # Collect all possible headers
        enriched_headers = set(itertools.chain.from_iterable(d.keys() for d in enriched_data))

        # Generate unique file name
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        enriched_file_name = f'enriched_{timestamp}_{file_name}'
        enriched_file_path = os.path.join(settings.MEDIA_ROOT, enriched_file_name)
        print("Enriched File Path:", enriched_file_path)
        print("Enriched Headers:", enriched_headers)
        with open(enriched_file_path, 'w', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=enriched_headers)
            writer.writeheader()
            writer.writerows(enriched_data)

        return JsonResponse({'message': 'Data enriched successfully', 'newFileName': enriched_file_name}, status=200)

    return JsonResponse({'error': 'Invalid request'}, status=400)

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
