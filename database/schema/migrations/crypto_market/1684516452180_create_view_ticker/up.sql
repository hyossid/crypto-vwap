CREATE OR REPLACE VIEW crypto_market.available_tickers AS (

SELECT DISTINCT ticker FROM crypto_market.latest_vwap_history

);
