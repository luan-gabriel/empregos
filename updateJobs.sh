#!/bin/bash
cd /home/ubuntu/empregos

# Atualiza o jobs.json
/usr/bin/node update.js

# Commit + push de todos os arquivos modificados
git add -A
git commit -m "Atualização automática $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || echo "Nada para commitar"
git push origin master
