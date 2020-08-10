import json

file = 'satisfaction.json'

with open(file, 'r') as f:
    data = json.load(f)

# headers
header = 'userId,roomName,satisfaction,roomtype'
rows = [header,header]

for d in data:
    room = str(d['roomName'])
    
    row = ''
    row += str(d['userId']) + ','
    row += room + ','
    row += str(d['satisfaction']) + ','
    row += str(d['roomtype'])

    if room != 'uiCampSun' and room != 'uiCampSat' and room != 'inClass19':
        rows.append(row)

with open('satisfaction.csv','w') as csvfile:
    for r in rows:
        csvfile.write(r + '\n')

print('\nDONE\n')