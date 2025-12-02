-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(64) NOT NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_templates` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isQuickStart` BOOLEAN NOT NULL DEFAULT false,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `defaultDurationEstimateMinutes` INTEGER NULL,
    `mainCategoryValueId` CHAR(36) NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL,

    INDEX `task_templates_userId_isQuickStart_idx`(`userId`, `isQuickStart`),
    INDEX `task_templates_userId_isArchived_idx`(`userId`, `isArchived`),
    INDEX `task_templates_userId_mainCategoryValueId_idx`(`userId`, `mainCategoryValueId`),
    UNIQUE INDEX `task_templates_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_entries` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `taskTemplateId` CHAR(36) NULL,
    `mainCategoryValueId` CHAR(36) NULL,
    `titleOverride` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `startedAt` DATETIME(0) NOT NULL,
    `endedAt` DATETIME(0) NULL,
    `durationSeconds` INTEGER NULL,
    `isRunning` BOOLEAN NOT NULL DEFAULT true,
    `deletedAt` DATETIME(0) NULL,
    `localDate` DATE NULL,
    `year` INTEGER NULL,
    `month` INTEGER NULL,
    `weekOfYear` INTEGER NULL,
    `dayOfWeek` INTEGER NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL,

    INDEX `time_entries_userId_localDate_idx`(`userId`, `localDate`),
    INDEX `time_entries_userId_startedAt_idx`(`userId`, `startedAt`),
    INDEX `time_entries_userId_taskTemplateId_idx`(`userId`, `taskTemplateId`),
    INDEX `time_entries_userId_isRunning_idx`(`userId`, `isRunning`),
    INDEX `time_entries_userId_mainCategoryValueId_idx`(`userId`, `mainCategoryValueId`),
    INDEX `time_entries_userId_year_weekOfYear_idx`(`userId`, `year`, `weekOfYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_dimensions` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL,

    INDEX `category_dimensions_userId_sortOrder_idx`(`userId`, `sortOrder`),
    UNIQUE INDEX `category_dimensions_userId_name_key`(`userId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_values` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `dimensionId` CHAR(36) NOT NULL,
    `parentId` CHAR(36) NULL,
    `label` VARCHAR(191) NOT NULL,
    `code` VARCHAR(50) NULL,
    `color` VARCHAR(20) NULL,
    `isArchived` BOOLEAN NOT NULL DEFAULT false,
    `isProductive` BOOLEAN NOT NULL DEFAULT false,
    `metaTags` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL,

    INDEX `category_values_userId_dimensionId_idx`(`userId`, `dimensionId`),
    INDEX `category_values_dimensionId_parentId_idx`(`dimensionId`, `parentId`),
    INDEX `category_values_userId_isArchived_idx`(`userId`, `isArchived`),
    INDEX `category_values_userId_isProductive_idx`(`userId`, `isProductive`),
    INDEX `category_values_code_idx`(`code`),
    UNIQUE INDEX `category_values_dimensionId_label_key`(`dimensionId`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_template_categories` (
    `id` CHAR(36) NOT NULL,
    `taskTemplateId` CHAR(36) NOT NULL,
    `categoryValueId` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `task_template_categories_categoryValueId_idx`(`categoryValueId`),
    UNIQUE INDEX `task_template_categories_taskTemplateId_categoryValueId_key`(`taskTemplateId`, `categoryValueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_entry_categories` (
    `id` CHAR(36) NOT NULL,
    `timeEntryId` CHAR(36) NOT NULL,
    `categoryValueId` CHAR(36) NOT NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `time_entry_categories_categoryValueId_idx`(`categoryValueId`),
    UNIQUE INDEX `time_entry_categories_timeEntryId_categoryValueId_key`(`timeEntryId`, `categoryValueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_aggregates` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `bucketType` ENUM('DAY', 'WEEK', 'MONTH', 'CUSTOM') NOT NULL,
    `bucketStart` DATE NOT NULL,
    `taskTemplateId` CHAR(36) NULL,
    `categoryValueId` CHAR(36) NULL,
    `totalDurationSeconds` INTEGER NOT NULL DEFAULT 0,
    `entryCount` INTEGER NOT NULL DEFAULT 0,
    `lastComputedAt` DATETIME(0) NULL,
    `createdAt` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` TIMESTAMP(6) NOT NULL,

    INDEX `time_aggregates_userId_bucketType_bucketStart_idx`(`userId`, `bucketType`, `bucketStart`),
    UNIQUE INDEX `time_aggregates_userId_bucketType_bucketStart_taskTemplateId_key`(`userId`, `bucketType`, `bucketStart`, `taskTemplateId`, `categoryValueId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `task_templates` ADD CONSTRAINT `task_templates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_templates` ADD CONSTRAINT `task_templates_mainCategoryValueId_fkey` FOREIGN KEY (`mainCategoryValueId`) REFERENCES `category_values`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_taskTemplateId_fkey` FOREIGN KEY (`taskTemplateId`) REFERENCES `task_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_mainCategoryValueId_fkey` FOREIGN KEY (`mainCategoryValueId`) REFERENCES `category_values`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_dimensions` ADD CONSTRAINT `category_dimensions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_values` ADD CONSTRAINT `category_values_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_values` ADD CONSTRAINT `category_values_dimensionId_fkey` FOREIGN KEY (`dimensionId`) REFERENCES `category_dimensions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_values` ADD CONSTRAINT `category_values_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `category_values`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_template_categories` ADD CONSTRAINT `task_template_categories_taskTemplateId_fkey` FOREIGN KEY (`taskTemplateId`) REFERENCES `task_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_template_categories` ADD CONSTRAINT `task_template_categories_categoryValueId_fkey` FOREIGN KEY (`categoryValueId`) REFERENCES `category_values`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entry_categories` ADD CONSTRAINT `time_entry_categories_timeEntryId_fkey` FOREIGN KEY (`timeEntryId`) REFERENCES `time_entries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entry_categories` ADD CONSTRAINT `time_entry_categories_categoryValueId_fkey` FOREIGN KEY (`categoryValueId`) REFERENCES `category_values`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_aggregates` ADD CONSTRAINT `time_aggregates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_aggregates` ADD CONSTRAINT `time_aggregates_taskTemplateId_fkey` FOREIGN KEY (`taskTemplateId`) REFERENCES `task_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_aggregates` ADD CONSTRAINT `time_aggregates_categoryValueId_fkey` FOREIGN KEY (`categoryValueId`) REFERENCES `category_values`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
