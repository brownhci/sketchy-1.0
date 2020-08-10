import json, csv

file = 'peekInteractions.json'
file = 'peekInteractions2.json'

with open(file, 'r') as f:
    data = json.load(f)

header = '_id, userId, room, interactionType, review, peekedUserId, peekTime, time, num_strokes, num_fit_strokes, num_points, num_fit_points, num_corners, sum_dist, sum_diff, sum_angle, sum_sq_angle, box_area, hull_area, aspect_ratio, entropy, box_length, box_angle, path_length, cosine_initial, sine_initial, cosine_final, sine_final, avg_dist, avg_diff, avg_angle, std_dist, std_diff, std_angle'
print('\n\n')
rows = [header,header]

for d in data:
    row = ''
    row += str(d['interaction']['_id']) + ','
    row += str(d['interaction']['userId']) + ','
    row += str(d['interaction']['room']) + ','
    row += str(d['interaction']['interactionType']) + ','
    row += str(d['interaction']['interactionData']['review']) + ','
    row += str(d['interaction']['interactionData']['peekedUserId']) + ','
    row += str(d['interaction']['interactionData']['peekTime']) + ','
    row += str(d['interaction']['time']) + ','
    row += str(d['features']['num_strokes']) + ','
    row += str(d['features']['num_fit_strokes']) + ','
    row += str(d['features']['num_points']) + ','
    row += str(d['features']['num_fit_points']) + ','
    row += str(d['features']['num_corners']) + ','
    row += str(d['features']['sum_dist']) + ','
    row += str(d['features']['sum_diff']) + ','
    row += str(d['features']['sum_angle']) + ','
    row += str(d['features']['sum_sq_angle']) + ','
    row += str(d['features']['box_area']) + ','
    row += str(d['features']['hull_area']) + ','
    row += str(d['features']['aspect_ratio']) + ','
    row += str(d['features']['entropy']) + ','
    row += str(d['features']['box_length']) + ','
    row += str(d['features']['box_angle']) + ','
    row += str(d['features']['path_length']) + ','
    row += str(d['features']['cosine_initial']) + ','
    row += str(d['features']['sine_initial']) + ','
    row += str(d['features']['cosine_final']) + ','
    row += str(d['features']['sine_final']) + ','
    row += str(d['features']['avg_dist']) + ','
    row += str(d['features']['avg_diff']) + ','
    row += str(d['features']['avg_angle']) + ','
    row += str(d['features']['std_dist']) + ','
    row += str(d['features']['std_diff']) + ','
    row += str(d['features']['std_angle']) + ','

    room = str(d['interaction']['room'])
    if room != 'uiCampSun' and room != 'uiCampSat' and room != 'inClass19':
        rows.append(row)

with open('peekinteractions2.csv','w') as csvfile:
    for r in rows:
        csvfile.write(r + '\n')

print('\nDONE\n')