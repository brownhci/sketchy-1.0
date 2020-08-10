import json

file = 'peeks.json'

with open(file, 'r') as f:
    data = json.load(f)

# headers
header = 'userId,peekedUserId,room,isMobile,startTime,peekedVote,endTime,timeSpent,sketchChanged'
rows = [header,header]

for d in data:
  rows.append(','.join([str(d[key]) for key in header.split(',')]))

with open('peekTime19.csv','w') as csvfile:
    for r in rows:
        csvfile.write(r + '\n')
