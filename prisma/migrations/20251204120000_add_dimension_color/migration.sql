-- Add color to category dimensions
ALTER TABLE `category_dimensions`
ADD COLUMN `color` VARCHAR(20) NULL AFTER `description`;
