cd /home/missoandfriends/moaf-json-api
if [ -f ./lock ]; then
    echo Another instance of server is running
    exit;
fi
nohup jetty:run-war -DskipTests -Dapp.properties=/home/missoandfriends/moaf-json-api/src/main/webapp/WEB-INF/application.properties 2> /home/missoandfriends/moaf-json-$
echo $! > /home/missoandfriends/moaf-json-api/lock
