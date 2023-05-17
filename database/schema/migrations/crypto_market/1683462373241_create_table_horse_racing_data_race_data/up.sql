CREATE SCHEMA "crypto_market";
CREATE TABLE "crypto_market"."transactions"
(
    "tradeid" varchar NOT NULL,
    "ticker" varchar NOT NULL,
    "ts" numeric NOT NULL,
    "quantity" numeric NOT NULL,
    "price" numeric NOT NULL,
    PRIMARY KEY ("tradeid")
);COMMENT ON TABLE "crypto_market"."transactions" IS E'raw transaction data ';
