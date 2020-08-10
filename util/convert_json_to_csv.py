import json

file = 'peeks.json'
file = 'inClass19.json'

with open(file, 'r') as f:
    data = json.load(f)

# headers
header = 'id,userId,isMobile,Sat,uiCampSat,uiCampSat1,uiCampSat2,uiCampSat3,Sun,uiCampSun,uiCampSun1,uiCampSun2,uiCampSun3,inClass,inClass19_1,inClass19_2,inClass19_3,sketchExperience,designExperience,sketchLikelihood,effective-viewing-for-improving,findQ_Looking at photographs of real-world objects,findQ_View images of designs on the Internet,findQ_Find a collaborator,findQ_Other,findQ_None of the above,didPostSurvey?,exploratio,collaboratio,engagement,effort,transparency,expressiveness,csi-rank_exploratio,csi-rank_collaboratio,csi-rank_engagement,csi-rank_effort,csi-rank_transparency,csi-rank_expressiveness,effective-conceptually-similar-neighbor,how-effective,effective-conceptually-different,effective-conceptually-similar'
print(header)

def convertMobile(isMobile):
    if isMobile == True:
       return '1,'
    else:
        return '0,'

def checkRooms(room,rooms):
    s = '0,'
    for r in rooms:
        if r == room:
            s = '1,' 
    return s

def getRooms(rooms):
    r = ''
    r += checkRooms('Sat', rooms)
    r += checkRooms('uiCampSat1', rooms)
    r += checkRooms('uiCampSat2', rooms)
    r += checkRooms('uiCampSat3', rooms)
    r += checkRooms('Sun', rooms)
    r += checkRooms('uiCampSun1', rooms)
    r += checkRooms('uiCampSun2', rooms)
    r += checkRooms('uiCampSun3', rooms) 
    r += checkRooms('inClass', rooms)
    r += checkRooms('inClass19_1', rooms)
    r += checkRooms('inClass19_2', rooms)
    r += checkRooms('inClass19_3', rooms)      
    return r

def convertSurveyResults(res):
    r = str(res['sketchExperience']) + ','
    r += str(res['designExperience']) + ','
    r += str(res['sketchLikelihood']) + ','
    r += str(res['effective-viewing-for-improving']) + ','

    ic = str(res['inspirationChoices'])

    if 'Looking at photographs of real-world objects' in ic:
        r += '1,'
    else:
        r += '0,'

    if 'View images of designs on the Internet' in ic:
        r += '1,'
    else:
        r += '0,'

    if 'Find a collaborator' in ic:
        r += '1,'
    else:
        r += '0,'

    if 'Other' in ic:
        r += '1,'
    else:
        r += '0,'

    if 'None of the above' in ic:
        r += '1,'
    else:
        r += '0,'

    return r

def check(dic,k1,k2):
    if k1 in dic:
        if k2 in dic[k1]:
            return str(dic[k1][k2]) + ','
        else:
            return '"",'
    else:
        return '"",'

def convertPostSurveyResults(res):
    r = '1,'
    r += str(res['exploration']) + ','
    r += str(res['collaboration']) + ','
    r += str(res['engagement']) + ','
    r += str(res['effort']) + ','
    r += str(res['transparency']) + ','
    r += str(res['expressiveness']) + ','
    r += check(res,'csi-rank','exploration')
    r += check(res,'csi-rank','collaboration')
    r += check(res,'csi-rank','engagement')
    r += check(res,'csi-rank','effort')
    r += check(res,'csi-rank','expressiveness')
    r += check(res,'csi-rank','transparency')
    
    if 'effective-conceptually-similar-neighbor' in res:
        r += str(res['effective-conceptually-similar-neighbor']) + ','
    else:
        r += '"",'

    if 'how-effective' in res:
        r += str(res['how-effective']) + ','
    else:
        r += '"",'
    if 'effective-conceptually-different' in res:
        r += str(res['effective-conceptually-different']) + ','
    else:
        r += '"",'
    if 'effective-conceptually-similar' in res:
        r += str(res['effective-conceptually-similar']) + ','
    else:
        r += '"",'

    return r

for id,d in data.items():
    row = id + ','
    row += d['user']['userId'] + ','
    row += convertMobile(d['user']['isMobile'])
    row += getRooms(d['rooms'])
    row += convertSurveyResults(d['user']['surveyResults'])
    if 'postSurveyResults' in d['user']:
        row += convertPostSurveyResults(d['user']['postSurveyResults'])
    else:
        row += '0,'
    print(row)

print('\nDONE\n')