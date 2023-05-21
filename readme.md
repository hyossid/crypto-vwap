
# Faulty Websocket (VWAP-Processor)

This project provides a VWAP (Volume-weighted average price) calculator. The VWAP is calculated based on data received from two channels: a WebSocket channel (which may occasionally be faulty) and a reliable REST channel.

To be considered as valid data for processing, the input should follow the format (ticker, ts, quantity, price, tradeId).

The configuration options for the input channels and the interval (defaulted to 5 minutes) can be customized through environment variables.


**VWAP-Processor is composed as:**

<img width="705" alt="image" src="https://github.com/hyossid/crypto-vwap/assets/34973707/4b967959-dc32-4853-a4c4-94fe292ea5cc">




1. API Controller : API Controller is a node.js REST API server where handles user's request, pulls data from DB and give response. Input us guarded using `guard` Nest.js decorator. Swagger is available on `<host>:port/swagger.json`. 
  - Currently available endpoints are :
    - /health : Checks status of API 
    - /latest : Returns latest 5 minute rolling VWAP (Params: {‘ticker’: ‘BTC’})
    - /historical : Returns 5 minute rolling VWAP as of a timestamp (Params: {‘ticker’: ‘BTC’, ‘ts’: 1684083600000 })

2. websocket-watcher: The websocket-watcher module establishes a WebSocket connection to the designated endpoint. It validates the initial input format and saves the data to the database. Since the data received through WebSocket might be faulty, a flag is_validated is set to false for these entries.
3. vwap-calculator: The vwap-calculator module calculates the latest VWAP based on the data received through WebSocket. It then saves the calculated VWAP value to the database, along with the corresponding ticker and timestamp in the second mark.
4. rest-watcher: The rest-watcher module is responsible for requesting trade data from the REST endpoint. It processes the data in parallel (asynchronously) based on the ticker. It requests the data, receives the response, and updates the database with a is_validated flag set to true for the received entries. It also calculates the VWAP using the reliable data source obtained from the REST endpoint. Additionally, it saves the latest received timestamp (since the response is limited to 100 data points) for stateful processing.
5. Postgres : Main database for this project. 

6. Hasura console : This console is for DB monitoring for good development experience. It also tracks schema migration

rational behind design : 
- Hasura is a graphql engine, but it is really a good tool to track migration, monitor DB and run SQL without using independent tool such as pgadmin, datagrip.
- using slonik rather than ORM, since sql is much reliable.
## Getting started

1. ./bin/start_db up 
2. docker-compose up -d 
3. docker ps 



### If not want to use docker-compose 

docker build -f Dockerfile.worker -t crypto_market_worker . 
docker run --network=crypto_market_default -e PG_STRING=postgres://postgres:postgres@postgres/crypto_market --name crypto_market_worker crypto_market_worker


docker build -f Dockerfile.api -t crypto_market_api .
docker run --network=crypto_market_default -e PG_STRING=postgres://postgres:postgres@postgres/crypto_market --name crypto_market_api -p 3003:3003 crypto_market_api




### Useful DB queries

select * , ts -validated_until from crypto_market.latest_vwap_history as a left join crypto_market.tickers_validation_timestamp as b on a.ticker = b.ticker
