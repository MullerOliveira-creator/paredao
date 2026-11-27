@echo off
cd /d "%~dp0"
echo Abrindo o Paredao em http://127.0.0.1:8888/
echo Deixe esta janela aberta enquanto usa. Para parar, feche-a.
start "" http://127.0.0.1:8888/
where py >nul 2>nul && (py -m http.server 8888 --bind 127.0.0.1) || (python -m http.server 8888 --bind 127.0.0.1)
pause
