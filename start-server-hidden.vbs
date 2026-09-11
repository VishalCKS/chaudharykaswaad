Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\GOURAV\Downloads\ezgif-180568ba149ba05d-jpg"
WshShell.Run """C:\Users\GOURAV\AppData\Local\Programs\nodejs\node.exe"" server.js", 0, False
