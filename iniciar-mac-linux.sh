#!/bin/sh
cd "$(dirname "$0")"
echo "Abrindo o Paredao em http://127.0.0.1:8888/ (Ctrl+C para parar)"
(sleep 1; open http://127.0.0.1:8888/ 2>/dev/null || xdg-open http://127.0.0.1:8888/ 2>/dev/null) &
python3 -m http.server 8888 --bind 127.0.0.1
