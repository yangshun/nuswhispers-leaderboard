import json

def process_data(data):

  member_dict = {}
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
      activity_score += member['comment_count']

    if 'like_count' in member:
      activity_score += 2 * member['like_count']

    activity_dict[member['id']] = {
      'facebook_id': member_id,
      'activity_score': activity_score,
      'name': member['name'],
      'like_count': member['like_count'],
      'comment_count': member['comment_count'],
    }

  return activity_dict

def top_k_active_members(data, k):
  members_list = [value for (key, value) in data.items()]
  members_list.sort(key=lambda x: x['activity_score'], reverse=True)
  return members_list[:k]

def read_files(files):
  combined_data = []
  for file in files:
    with open('./data/' + file + '.json') as data_file:
      data = json.load(data_file)
      combined_data.extend(data['data'])
  return combined_data

def process():
  combined_data = read_files(['2015-05-04', '2015-05-05', '2015-05-06', '2015-05-07', '2015-05-08', '2015-05-09', '2015-05-10'])
  activity_dict = process_data(combined_data)
  active_members = top_k_active_members(activity_dict, 50)
  open('./leaderboard/may.json', 'w').write(json.dumps(active_members))

process()
