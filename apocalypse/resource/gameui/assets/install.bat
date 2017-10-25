@ECHO OFF
CD ./
:LOOP
SET /P package1= Instalar paquete: 
CALL bower uninstall %package1% --save --quiet
CALL bower install %package1% --save --quiet --force-latest --production
echo ">> %package1% ha sido instalado"
GOTO LOOP