-- Products table for the admin "Add Product" flow.
--
-- The backend creates this automatically via Sequelize `sync({ alter: true })`
-- when the server starts, so you normally do NOT need to run this by hand.
-- It is kept here so the table can be created or inspected directly in
-- phpMyAdmin, and so the exact shape the code expects is written down.
--
-- Run against the `navtech-db` database.

CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT            NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255)   NOT NULL,
  `price`       DECIMAL(10, 2) NOT NULL,
  `description` TEXT           NULL,
  `image`       VARCHAR(255)   NULL,
  `category`    VARCHAR(255)   NOT NULL,
  `stock`       INT            NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- The store and admin table both read newest-first; the index keeps that
  -- ORDER BY from becoming a full sort once the catalog grows.
  KEY `products_created_at` (`created_at`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
