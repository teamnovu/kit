
cd docker && docker compose up &

# This currently works but it goes on with the script before all plugins are installed.
# thus the first time this runs we may have to run the script twice.
until curl --output /dev/null --silent --head --fail http://localhost:8500; do
    sleep 3
done


pnpm dlx @shopware/api-gen loadSchema --apiType=store
pnpm dlx @shopware/api-gen generate --apiType=store

cd docker && docker compose down
