
1. ./bin/start_db up 
2. docker-compose up -d 
3. docker ps 



### If not want to use docker-compose 

docker build -f Dockerfile.worker -t crypto_market_worker . 
docker run --network=crypto_market_default -e PG_STRING=postgres://postgres:postgres@postgres/crypto_market --name crypto_market_worker crypto_market_worker


docker build -f Dockerfile.api -t crypto_market_api .
docker run --network=crypto_market_default -e PG_STRING=postgres://postgres:postgres@postgres/crypto_market --name crypto_market_api -p 3003:3003 crypto_market_api

