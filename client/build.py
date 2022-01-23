import os
import sys


htmlPath = "./build/index.html"

fileContent = ""
with open(htmlPath, "r") as f:
    fileContent = f.readline()

startToken = "<script>"
endToken = "</script>"
rawJsStart = fileContent.find(startToken)
rawJsEnd = fileContent.find(endToken)

if rawJsStart == -1 or rawJsEnd == -1:
    print("Could not detect the raw script...")
    sys.exit()

rawJs = fileContent[rawJsStart + len(startToken): rawJsEnd]

runnerPath = "./build/runner.js"
if os.path.exists(runnerPath):
    print("runner.js already exists... removing it")
    os.remove(runnerPath)

with open(runnerPath, "w") as f:
    print("created runner.js...")
    f.write(rawJs)

embedContent = '<script src="./runner.js"> </script>'
fileContent = fileContent[:rawJsStart] + embedContent + fileContent[rawJsEnd + len(endToken):]

newTabBuildPath = "./build/newtab.html"
with open(newTabBuildPath, "w") as f:
    print("re-created index.html...")
    f.write(fileContent)
