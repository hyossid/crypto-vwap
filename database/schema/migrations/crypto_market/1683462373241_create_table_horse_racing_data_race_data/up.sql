CREATE SCHEMA "crypto_market";
CREATE TABLE "crypto_market"."transactions"
(
    "tradeid" varchar NOT NULL,
    "ticker" varchar NOT NULL,
    "ts" numeric NOT NULL,
    "quantity" numeric NOT NULL,
    "price" numeric NOT NULL,
    "is_validated" boolean NOT NULL,
    PRIMARY KEY ("tradeid")
);COMMENT ON TABLE "crypto_market"."transactions" IS E'raw transaction data ';

CREATE INDEX
    "idx_transactions"
    ON crypto_market.transactions USING BTREE ("ticker");

CREATE TABLE "crypto_market"."vwap_history"
(
    "ticker" varchar NOT NULL,
    "ts" numeric NOT NULL,
    "price" numeric NOT NULL,
    "interval" varchar NOT NULL,
    PRIMARY KEY ("ticker","ts")
);COMMENT ON TABLE "crypto_market"."vwap_history" IS E'vwap history data ';

CREATE INDEX
    "idx_vwap_history"
    ON crypto_market.vwap_history USING BTREE ("ticker");

CREATE TABLE "crypto_market"."latest_vwap_history"
(
    "ticker" varchar NOT NULL,
    "ts" numeric NOT NULL,
    "price" numeric NOT NULL,
    "interval" varchar NOT NULL,
    PRIMARY KEY ("ticker")
);COMMENT ON TABLE "crypto_market"."latest_vwap_history" IS E'latest_vwap history data ';
