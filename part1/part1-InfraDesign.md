## Part1 - Infra Design

### 1. There is a REST endpoint that provides end of day data for a variety of tickers. However, data becomes available by ticker at inconsistent different times after end of day. Suppose the endpoint is expensive to query. How do you scrape data as it becomes available?

- If API provider supports `HEAD` endpoint, it would be a good option to hit `HEAD` request first. `HEAD` is normally used to check if `GET` endpoint is available especially when `GET` endpoint produces large data download. It reads `Content-Length` header of `GET`, so by polling this cheaper `HEAD` endpoint, we would know when data is available and scrape it once it is ready. 
- If API provider has web html which can be clue of data availability, we can scrape that html and check using python web scraper as another solution too.  
- If API provider does not support `HEAD` nor HTML, I could think of below solution; 
  1. After end of day from midnight, do endpoint polling at the beginning in certain interval (ig. 30 mins cronjob) until you get successful response, then record the timestamp. (Cronjob using GCP Cloud Function and sink to Cloud storage or Bigquery)
  2. Following above manner, collect the data with tag (ticker , timestamp)
  3. With enough data collected, do train simple regression model or simple neural network such as FNN, we can use Google Colab and do data engineering in pandas, import model using pytorch. Colab is available in GCP marketplace so can easily import data in GCP databases.
  4. Predict and assign scores by time window
  5. With built model, we can request expensive REST api at the end of timewindow which has the highest score. 
 
### 2. We have a SQL trade history database with unique order ID’s. There are multiple parallel scripts recording to the database. How do you prevent collisions in generating a new order ID from one of the parallel scripts? What database would be best for this?

- Best option I can think of is to generate **ULID** from each independent script and save it to database. Similar to UUID, it can be generated in an isolated process, ensuring uniqueness even in distributed environments. However, it is generated in timely manner. Which means, it would significantly improve the query efficiency of database since its sorted. Also, if database needs to be migrated with other databases in the future, you won't have to worry about primary key collision since ULID won't collide. 
- However, generating ULID needs programming language, imagine script is written in bash. On that case we got to use **UUID** as an alternative. Like ULID, it can be generated in isolated process, ensuring uniqueness. The process of generating UUIDs does not rely on complex algorithms, making it straightforward. It is also standardized by RFC where ULID is not that standardized yet. (reference to UUID https://www.ietf.org/rfc/rfc4122.txt)
- If we don't have to think of database migration, there are other options of using **auto-increment ID**. This approach is slightly easiler since we are forwarding the responsibility of having unique ID to persistent layer (DB) from application layer, so each parallel scripts dont have to care about saving data in database. Of course we don't have to worry about database isolation level in this case too. **auto-increment ID** is supported by lots of relational database like Postgres(sequences), MariaDB. Sequential ID is best in terms of data storing since it allows efficient query. 
- I would choose to use relational database like **Postgres** since its record of `transactions`. Documental model database such as MongoDB is good for the data which has high locality (like user profiles), where it doesnt apply well on this case.
- There is also a project called Snowflake ID by twitter. (reference https://betterprogramming.pub/uuid-generation-snowflake-identifiers-unique-2aed8b1771bc)



### 3. We want to scrape a large amount of data from a particular endpoint as quickly as possible, but the endpoint has server-side constraints on the number of requests per second it can take. How do you deploy a scraper that dynamically shrinks/scales to scrape data as quickly as possible?

- Endpoints designed for scraping often exhibit similar patterns or characteristics on a daily basis. For instance, there are usually consistent peak hours of requests observed throughout the day. Therefore, I think it is important to know the pattern of request in server-side. Best would be the choice where service provider offers the metric, but I'll assume that is not the case.
- I would like to first suggest to make a requests as it is, either it is websocket, long polling or regular polling. We'll face latency or error respones of 500 on specific time window.  
- We'll capture the throttling instances on a daily basis(timestamp, throttled_number), including the number of occurrences and corresponding timestamps. By recording historical data, it becomes possible to identify optimal time windows and maintain an adequate frequency for data collection or scraping operations. 
