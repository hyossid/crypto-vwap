### Part1 - Infra Design

1. There is a REST endpoint that provides end of day data for a variety of tickers. However, data becomes available by ticker at
inconsistent different times after end of day. Suppose the endpoint is expensive to query. How do you scrape data as it
becomes available?

- If API provider supports `HEAD` endpoint, it would be a good option to hit `HEAD` request first. `HEAD` is normally used to check if `GET` endpoint is available especially when `GET` endpoint produces large data download. It reads `Content-Length` header of `GET`, so by polling this cheaper `HEAD` endpoint, we would know when data is available and scrape it once it is ready. 
- If API provider has web html which can be clue of data availability, we can scrape that html and check using python web scraper as another solution too.  
- If API provider does not support `HEAD` nor HTML, I could think of below solution; 
  - After end of day from midnight, do endpoint polling at the beginning in certain interval (ig. 30 mins cronjob) until you get successful response, then record the timestamp. (Cronjob using GCP Cloud Function and sink to Cloud storage or Bigquery)
  - Following above manner, collect the data with tag (ticker , timestamp)
  - With enough data collected, do train simple regression model or simple neural network such as FNN, we can use Google Colab and do data engineering in pandas, import model using pytorch. Colab is available in GCP marketplace so can easily import data in GCP databases.
  - Predict and assign scores by time window
  - With built model, we can request expensive REST api at the end of timewindow which has the highest score. 
 
2. We have a SQL trade history database with unique order ID’s. There are multiple parallel scripts recording to the database.
How do you prevent collisions in generating a new order ID from one of the parallel scripts? What database would be best
for this?

- Depending on the nature of data write, I would like to decide the database isolation level first. (Either read commited , non-repeatable read, serializable)
- If Serializalbe, then can just use auto-increment ID which is supported by lots of relational database like Postgres, MariaDB
- If other isolation level, I would do the following
  - 

Postgres 
Scalable DB - Cassandra 


3. We want to scrape a large amount of data from a particular endpoint as quickly as possible, but the endpoint has server-side
constraints on the number of requests per second it can take. How do you deploy a scraper that dynamically shrinks/scales
to scrape data as quickly as possible?

- I would like to first suggest to make a requests as it is, then when we face latency or quite a number of 500 requests, 
- Endpoints designed for scraping often exhibit similar patterns or characteristics on a daily basis. For instance, there are usually consistent peak hours of requests observed throughout the day.
- Hence, it is beneficial to capture the throttling instances on a daily basis(timestamp, throttled_number), including the number of occurrences and corresponding timestamps. By recording historical data, it becomes possible to identify optimal time windows and maintain an appropriate frequency for data collection or scraping operations.
