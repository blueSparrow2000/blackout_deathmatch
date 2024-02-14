f = open("./locations.txt", 'r')
lines = f.readlines()

LocationName = ""
index = 1

for line in lines:
    line = line.strip()  # 줄 끝의 줄 바꿈 문자를 제거한다.
    content = line.split(',')
    if (len(content) == 1): #this is a name
        index = 1 # reset index when meet other location name
        words = line.split('-')
        LocationName = words[0].strip()
    if (len(content)==2):
        print("'%s%s':{row:%s, col:%s},"%(LocationName,index,content[1],content[0])) # switch row col
        index+=1

f.close()












