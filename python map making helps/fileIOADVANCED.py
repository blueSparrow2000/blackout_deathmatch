f = open("./locations.txt", 'r')
lines = f.readlines()

LocationName = ""
index = 1
request1 = ""
request2 = ""

for line in lines:
    line = line.strip()  # 줄 끝의 줄 바꿈 문자를 제거한다.
    content = line.split(',')
    if (len(content) == 1): #this is a name
        words = content[0].split('-')
        if (len(words)==3):
            index = 1 # reset index when meet other location name
            LocationName = words[0].strip()
            request1 = words[1].strip()
            request2 = words[2].strip()
    if (len(content)==2):
        # request:['gun','random']
        print("'%s%s':{row:%s, col:%s, request:['%s','%s']},"%(LocationName,index,content[1],content[0], request1,request2)) # switch row col
        index+=1

f.close()












