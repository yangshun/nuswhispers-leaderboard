import httplib
import json
from time import ctime

ACCESS_TOKEN = 'CAACEdEose0cBAOWmsc1MWt2pxT2IDPD9BEWaYcD1ndnKTzzgXfosN5vpPOK9bXMVSJAEz38lDp8TCfZARQJ5ATeKtwq9dgqYLZASSdSWk94B7V0kbUiJKVFs3MGP2qX9aIkEIPqlJs1hSM5uUtIDQYafozHZBZBPCS7YglJAiZA3wjXMP9xY45lwunMywDKlQ5KjUfzJQHJgjTwloLYAakJsAIiCbZBmwZD'

HOST = 'graph.facebook.com'
PATH = '/v2.3/nuswhispers/feed'

PARAMS = {
  'fields': ['comments{like_count,comments{like_count,from},from}', 'created_time'],
  'limit': 250,
  'access_token': ACCESS_TOKEN
}

params = []
for key in PARAMS:
  val = PARAMS[key]
  if type(val) is list:
    params.append(key + '=' + ','.join(val))
  else:
    params.append(key + '=' + str(val))

MAX_COUNT = 20
count = 0

feed_data = []

def request_data(host, path):
  global count

  print 'Fetching page', count + 1, '...'
  conn = httplib.HTTPSConnection(host)
  conn.request('GET', path)
  resp = conn.getresponse()
  result = json.loads(str(resp.read()))
  conn.close()

  feed_data.extend(result['data'])
  print len(result['data']), 'posts found!'

  if len(result['data']) > 0 and count < MAX_COUNT and result['paging']['next']:
    next_paging_url = result['paging']['next']
    next_path = next_paging_url.split('.com')[1]
    count += 1
    request_data(HOST, next_path)
  else:
    save_data(feed_data)

def save_data(data):
  dates = {}
  for post in data:
    date = post['created_time'].split('T')[0]
    if date not in dates:
      dates[date] = []
    dates[date].append(post)

  for date, content in dates.items():
    filedata = {
      'generated_time': ctime().split()[3],
      'data': date,
      'data': content
    }
    open('./data/' + date + '.json', 'w').write(json.dumps(filedata))

request_data(HOST, PATH + '?' + '&'.join(params))
