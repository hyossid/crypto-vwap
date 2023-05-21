
# Faulty Websocket (VWAP-Processor)

 This project provides a VWAP (Volume-weighted average price) calculator. The VWAP is calculated based on data received from two channels: a **WebSocket channel (which may occasionally be faulty)** and a **reliable REST channel**. 
 
 To be considered as valid data for processing, the input should follow the format `(ticker, ts, quantity, price, tradeId)`. 
 
 The configuration options for the input channels and the interval (defaulted to 5 minutes) can be customized through environment variables.


## Components of VWAP-Processor

<img width="705" alt="image" src="https://github.com/hyossid/crypto-vwap/assets/34973707/4b967959-dc32-4853-a4c4-94fe292ea5cc">




1. **API Controller** : API Controller is a node.js REST API server where handles user's request, pulls data from DB and give response. Input us guarded using `guard` Nest.js decorator. Swagger is available on `<host>:port/swagger.json`. 
  - Currently available endpoints are :
    - **/health** : Checks status of API 
    - **/latest** : Returns latest 5 minute rolling VWAP `(Params: {‘ticker’: ‘BTC’})`
    - **/historical** : Returns 5 minute rolling VWAP as of a timestamp `(Params: {‘ticker’: ‘BTC’, ‘ts’: 1684083600000 })`

2. **websocket-watcher**: The websocket-watcher module establishes a WebSocket connection to the designated endpoint. It validates the initial input format and saves the data to the database. Since the data received through WebSocket might be faulty, a flag is_validated is set to false for these entries.
3. **vwap-calculator**: The vwap-calculator module calculates the latest VWAP based on the data received through WebSocket. It then saves the calculated VWAP value to the database, along with the corresponding ticker and timestamp in the second mark.
4. **rest-watcher**: The rest-watcher module is responsible for requesting trade data from the REST endpoint. It processes the data in parallel (asynchronously) based on the ticker. It requests the data, receives the response, and updates the database with a `is_validated` flag set to true for the received entries. It also calculates the VWAP using the reliable data source obtained from the REST endpoint. Additionally, it saves the latest received timestamp (since the response is limited to 100 data points) for stateful processing.
5. **Postgres** : Main database for this project. Composed of below schema;
  - `transactions (tradeid, quantity, price, ticker, ts, is_validated)` : Trade data from Websocket & REST
  - `vwap_history (ticker, price, ts, interval, is_validated)` : Calculated VWAP values in timeseries
  - `latest_vwap_history (ticker, price, ts, interval)` : Latest VWAP 
  - `tickers_validation_timestamp (ticker, validated_until)` : Records last validated timestamp by ticker
  - `available_tickers (ticker)` : It is database view to record existing tickers  
6. **Hasura console** : This console is for DB monitoring for good development experience. It also tracks schema migration

<img width="898" alt="image" src="https://github.com/hyossid/crypto-vwap/assets/34973707/451de8be-f7a2-41a6-a0d3-fa5258bd1730">

## Getting started

**Make sure port 3003(api), 61790(hasura), 61791(postgres) is not in use**

### Setup database and hasura console

```bash
./bin/start_db up
```

### Start worker and api service, worker includes websocket-watcher, vwap-calculator, rest-watcher

```bash
docker-compose up -d
```

### Check if system is running fine. There should be 4 containers running

```bash
docker ps 
```

### Test API

```bash
curl localhost:3003/health 
curl localhost:3003/latest?ticker=BTC
```

### Access hasura console for db checking, **password is sidneyPassword**

```bash
http://localhost:61790/console 
```


## **Rationale behind design**
- For calculating VWAP, we have to use transaction supporting library & database, thats how I came across with `slonik` and `postgres` to use RDB. For calculating VWAP, SQL is much reliable than other query languages so decided to use RDB `Postgres`
- Data streaming usually requires buffer. However, assuming each record is 0.1KB, and rate seems to be maximum 50 records per second in websocket. 0.1 * 50 * 100000 (approximate 1day) = 500MB per day, 50 * 4 = 200 QPS for postgres is not heavy either read/write. 
- Isolation level of read-commited is enough since we have `tickers_validation_timestamp` table for tracking last updated timestamp. Which means, each asynchronous process in `rest-worker` does not process other data outside their data boundary. 
- Hasura is a graphql engine, but it is really a good tool to track migration, monitor DB and run SQL without using independent tool such as pgadmin, datagrip.
- Using docker-compose rather than k8s since this is single-host deployment and simple. 

## **Improvements**
- Architecture : For read-heavy systems, especailly in a system where good amount of data needs to be fed, using message queue such as Kafka infront of DB writing component (consumer) is safe in terms of data integrity and scalability. It allows decoupling each systems(ig data feeder running on its own pace and data consumer running its own pace) without risk of losing data. This allows system to be scalable. On this kind of application, I would like to implement a message queue infront of DB writer assuming their will be more input data from other sources.

- CI/CD : I would like to set up continuous integration (CI) using GitHub Actions. Whenever changes are merged into the main branch, I want it to trigger a workflow that builds a Docker image and pushes it to a designated Docker image registry.

- Deployment : I would suggest to deploy this application in **GCP Cloud Run** and connect database to **BigQuery**. GCP CloudRun is Knative platform where allows scalability and economical since its billed only used amount. It just requires you to push container image to artifact registry to use in CloudRun. I would like to choose GCP BigQuery since it saves lot of data, also scalable, billed only used amount and SQL friendly. It allows columnar storage too so it is better on data analytic perspective. 



### If you do not want to use docker-compose;

```bash
docker build -f Dockerfile.worker -t crypto_market_worker . 
docker run --network=crypto_market_default -e PG_STRING=postgres://postgres:postgres@postgres/crypto_market --name crypto_market_worker crypto_market_worker


docker build -f Dockerfile.api -t crypto_market_api .
docker run --network=crypto_market_default -e PG_STRING=postgres://postgres:postgres@postgres/crypto_market --name crypto_market_api -p 3003:3003 crypto_market_api
```




