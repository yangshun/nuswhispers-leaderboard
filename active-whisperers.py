import httplib
import json
from time import ctime

ACCESS_TOKEN = ''

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
    process_data(feed_data)

member_dict = {}

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


def process_data(data):

  save_data(data)

  def process_post(post):
    if 'comments' in post:
      for comment in post['comments']['data']:
        commenter_id = comment['from']['id']
        if commenter_id not in member_dict:
          member_dict[commenter_id] = comment['from']
          member_dict[commenter_id]['comment_count'] = 1
          member_dict[commenter_id]['like_count'] = comment['like_count']
        else:
          member_dict[commenter_id]['comment_count'] += 1
          member_dict[commenter_id]['like_count'] += comment['like_count']
        process_post(comment)

  for post in data:
    process_post(post)

  activity_dict = {}

  for member_id in member_dict:
    member = member_dict[member_id]
    activity_score = 0

    if 'comment_count' in member:
      activity_score += 3 * member['comment_count']

    if 'like_count' in member:
      activity_score += member['like_count']

    activity_dict[member['id']] = {
      'facebook_id': member_id,
      'activity_score': activity_score,
      'name': member['name'],
      'like_count': member['like_count'],
      'comment_count': member['comment_count'],
    }

  active_members = top_k_active_members(activity_dict, 50)
  for member in active_members:
    print member
  open('./leaderboard/april.json', 'w').write(json.dumps(active_members))

def top_k_active_members(data, k):
  members_list = [value for (key, value) in data.items()]
  members_list.sort(key=lambda x: x['activity_score'], reverse=True)
  return members_list[:k]

request_data(HOST, PATH + '?' + '&'.join(params))

