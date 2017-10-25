@ECHO OFF
CD ./
echo ">> Actualizando..."
echo ">> bower prune"
CALL bower prune
echo ">> ncu -m bower -u -a"
CALL ncu -m bower -u -a
echo ">> bower update --save --quiet --force-latest --production"
CALL bower update --save --quiet --force-latest --production
pause