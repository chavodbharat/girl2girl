
cd /home/missoandfriends/moaf-json-api

if [ ! -f ./lock ]; then
    echo Lock file not found. Kill java service manually
    exit
fi

mvn jetty:stop
rm ./lock
