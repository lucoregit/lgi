Set oWS = CreateObject("WScript.Shell")
strDesk = oWS.SpecialFolders("Desktop")
Set oLink = oWS.CreateShortcut(strDesk & "\LGI - Iniciar Sistema.lnk")
oLink.TargetPath = "C:\Windows\System32\cmd.exe"
oLink.Arguments = "/c """ & oWS.CurrentDirectory & "\iniciar_docker.bat"""
oLink.WorkingDirectory = oWS.CurrentDirectory
oLink.IconLocation = oWS.CurrentDirectory & "\icon.ico,0"
oLink.Description = "Iniciar Sistema LGI via Docker"
oLink.Save
