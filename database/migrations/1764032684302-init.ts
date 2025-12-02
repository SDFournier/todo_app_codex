import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1764032684302 implements MigrationInterface {
    name = 'Init1764032684302'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(191) NOT NULL, \`displayName\` varchar(191) NOT NULL, \`timezone\` varchar(64) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_user_email_unique\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_templates\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`name\` varchar(191) NOT NULL, \`description\` text NULL, \`isQuickStart\` tinyint NOT NULL DEFAULT 0, \`isArchived\` tinyint NOT NULL DEFAULT 0, \`defaultDurationEstimateMinutes\` int NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_tasktemplate_archived\` (\`userId\`, \`isArchived\`), INDEX \`IDX_tasktemplate_quickstart\` (\`userId\`, \`isQuickStart\`), UNIQUE INDEX \`UQ_tasktemplate_user_name\` (\`userId\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`time_entries\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`taskTemplateId\` varchar(36) NULL, \`titleOverride\` varchar(191) NULL, \`notes\` text NULL, \`startedAt\` datetime NOT NULL, \`endedAt\` datetime NULL, \`durationSeconds\` int NULL, \`isRunning\` tinyint NOT NULL DEFAULT 1, \`localDate\` date NOT NULL, \`year\` int NOT NULL, \`month\` int NOT NULL, \`weekOfYear\` int NOT NULL, \`dayOfWeek\` int NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_timeentry_user_week\` (\`userId\`, \`year\`, \`weekOfYear\`), INDEX \`IDX_timeentry_user_running\` (\`userId\`, \`isRunning\`), INDEX \`IDX_timeentry_user_template\` (\`userId\`, \`taskTemplateId\`), INDEX \`IDX_timeentry_user_startedAt\` (\`userId\`, \`startedAt\`), INDEX \`IDX_timeentry_user_localdate\` (\`userId\`, \`localDate\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category_dimensions\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`name\` varchar(191) NOT NULL, \`description\` text NULL, \`isSystem\` tinyint NOT NULL DEFAULT 0, \`sortOrder\` int NOT NULL DEFAULT '0', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_dimension_sort\` (\`userId\`, \`sortOrder\`), UNIQUE INDEX \`UQ_dimension_user_name\` (\`userId\`, \`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category_values\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`dimensionId\` varchar(36) NOT NULL, \`parentId\` varchar(36) NULL, \`label\` varchar(191) NOT NULL, \`code\` varchar(50) NULL, \`color\` varchar(20) NULL, \`isArchived\` tinyint NOT NULL DEFAULT 0, \`sortOrder\` int NOT NULL DEFAULT '0', \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`IDX_categoryvalue_code\` (\`code\`), INDEX \`IDX_categoryvalue_user_archived\` (\`userId\`, \`isArchived\`), INDEX \`IDX_categoryvalue_dimension_parent\` (\`dimensionId\`, \`parentId\`), INDEX \`IDX_categoryvalue_user_dimension\` (\`userId\`, \`dimensionId\`), UNIQUE INDEX \`UQ_categoryvalue_dimension_label\` (\`dimensionId\`, \`label\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_template_categories\` (\`id\` varchar(36) NOT NULL, \`taskTemplateId\` varchar(36) NOT NULL, \`categoryValueId\` varchar(36) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_tasktemplatecategory_value\` (\`categoryValueId\`), UNIQUE INDEX \`UQ_tasktemplate_category\` (\`taskTemplateId\`, \`categoryValueId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`time_entry_categories\` (\`id\` varchar(36) NOT NULL, \`timeEntryId\` varchar(36) NOT NULL, \`categoryValueId\` varchar(36) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_timeentrycategory_value\` (\`categoryValueId\`), UNIQUE INDEX \`UQ_timeentry_category\` (\`timeEntryId\`, \`categoryValueId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`time_aggregates\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(36) NOT NULL, \`bucketType\` enum ('DAY', 'WEEK', 'MONTH', 'CUSTOM') NOT NULL, \`bucketStart\` date NOT NULL, \`taskTemplateId\` varchar(36) NULL, \`categoryValueId\` varchar(36) NULL, \`totalDurationSeconds\` int NOT NULL DEFAULT '0', \`entryCount\` int NOT NULL DEFAULT '0', \`lastComputedAt\` datetime NULL, INDEX \`IDX_timeaggregate_bucket_lookup\` (\`userId\`, \`bucketType\`, \`bucketStart\`), UNIQUE INDEX \`UQ_timeaggregate_bucket\` (\`userId\`, \`bucketType\`, \`bucketStart\`, \`taskTemplateId\`, \`categoryValueId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`task_templates\` ADD CONSTRAINT \`FK_b9d016aa2cf42f90d5f5f8f65c0\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_entries\` ADD CONSTRAINT \`FK_d1b452d7f0d45863303b7d30000\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_entries\` ADD CONSTRAINT \`FK_8067616c11f992961547a3cb004\` FOREIGN KEY (\`taskTemplateId\`) REFERENCES \`task_templates\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_dimensions\` ADD CONSTRAINT \`FK_d8663a90a3b67f01b2383f64ddb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_values\` ADD CONSTRAINT \`FK_021341162504cc6e89af0c1fbcb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_values\` ADD CONSTRAINT \`FK_f915bc479f78066841f514c5b5f\` FOREIGN KEY (\`dimensionId\`) REFERENCES \`category_dimensions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`category_values\` ADD CONSTRAINT \`FK_16ea3beaba71998a5eb340d7fe7\` FOREIGN KEY (\`parentId\`) REFERENCES \`category_values\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_template_categories\` ADD CONSTRAINT \`FK_7c7b7e2ff7c1f5e2b257a82c903\` FOREIGN KEY (\`taskTemplateId\`) REFERENCES \`task_templates\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`task_template_categories\` ADD CONSTRAINT \`FK_7b77f714a3d86b2dc4375b6e843\` FOREIGN KEY (\`categoryValueId\`) REFERENCES \`category_values\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_entry_categories\` ADD CONSTRAINT \`FK_df297e09e8e5e49fc9cf3801f45\` FOREIGN KEY (\`timeEntryId\`) REFERENCES \`time_entries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_entry_categories\` ADD CONSTRAINT \`FK_df120b88a1f7970105cb7c5af2a\` FOREIGN KEY (\`categoryValueId\`) REFERENCES \`category_values\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_aggregates\` ADD CONSTRAINT \`FK_b56632497cac4aeecab09a01c2c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_aggregates\` ADD CONSTRAINT \`FK_4036b627cb7b2ceb197688ffec8\` FOREIGN KEY (\`taskTemplateId\`) REFERENCES \`task_templates\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`time_aggregates\` ADD CONSTRAINT \`FK_89453b9b256d2ccf48c982a3d8f\` FOREIGN KEY (\`categoryValueId\`) REFERENCES \`category_values\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`time_aggregates\` DROP FOREIGN KEY \`FK_89453b9b256d2ccf48c982a3d8f\``);
        await queryRunner.query(`ALTER TABLE \`time_aggregates\` DROP FOREIGN KEY \`FK_4036b627cb7b2ceb197688ffec8\``);
        await queryRunner.query(`ALTER TABLE \`time_aggregates\` DROP FOREIGN KEY \`FK_b56632497cac4aeecab09a01c2c\``);
        await queryRunner.query(`ALTER TABLE \`time_entry_categories\` DROP FOREIGN KEY \`FK_df120b88a1f7970105cb7c5af2a\``);
        await queryRunner.query(`ALTER TABLE \`time_entry_categories\` DROP FOREIGN KEY \`FK_df297e09e8e5e49fc9cf3801f45\``);
        await queryRunner.query(`ALTER TABLE \`task_template_categories\` DROP FOREIGN KEY \`FK_7b77f714a3d86b2dc4375b6e843\``);
        await queryRunner.query(`ALTER TABLE \`task_template_categories\` DROP FOREIGN KEY \`FK_7c7b7e2ff7c1f5e2b257a82c903\``);
        await queryRunner.query(`ALTER TABLE \`category_values\` DROP FOREIGN KEY \`FK_16ea3beaba71998a5eb340d7fe7\``);
        await queryRunner.query(`ALTER TABLE \`category_values\` DROP FOREIGN KEY \`FK_f915bc479f78066841f514c5b5f\``);
        await queryRunner.query(`ALTER TABLE \`category_values\` DROP FOREIGN KEY \`FK_021341162504cc6e89af0c1fbcb\``);
        await queryRunner.query(`ALTER TABLE \`category_dimensions\` DROP FOREIGN KEY \`FK_d8663a90a3b67f01b2383f64ddb\``);
        await queryRunner.query(`ALTER TABLE \`time_entries\` DROP FOREIGN KEY \`FK_8067616c11f992961547a3cb004\``);
        await queryRunner.query(`ALTER TABLE \`time_entries\` DROP FOREIGN KEY \`FK_d1b452d7f0d45863303b7d30000\``);
        await queryRunner.query(`ALTER TABLE \`task_templates\` DROP FOREIGN KEY \`FK_b9d016aa2cf42f90d5f5f8f65c0\``);
        await queryRunner.query(`DROP INDEX \`UQ_timeaggregate_bucket\` ON \`time_aggregates\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeaggregate_bucket_lookup\` ON \`time_aggregates\``);
        await queryRunner.query(`DROP TABLE \`time_aggregates\``);
        await queryRunner.query(`DROP INDEX \`UQ_timeentry_category\` ON \`time_entry_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeentrycategory_value\` ON \`time_entry_categories\``);
        await queryRunner.query(`DROP TABLE \`time_entry_categories\``);
        await queryRunner.query(`DROP INDEX \`UQ_tasktemplate_category\` ON \`task_template_categories\``);
        await queryRunner.query(`DROP INDEX \`IDX_tasktemplatecategory_value\` ON \`task_template_categories\``);
        await queryRunner.query(`DROP TABLE \`task_template_categories\``);
        await queryRunner.query(`DROP INDEX \`UQ_categoryvalue_dimension_label\` ON \`category_values\``);
        await queryRunner.query(`DROP INDEX \`IDX_categoryvalue_user_dimension\` ON \`category_values\``);
        await queryRunner.query(`DROP INDEX \`IDX_categoryvalue_dimension_parent\` ON \`category_values\``);
        await queryRunner.query(`DROP INDEX \`IDX_categoryvalue_user_archived\` ON \`category_values\``);
        await queryRunner.query(`DROP INDEX \`IDX_categoryvalue_code\` ON \`category_values\``);
        await queryRunner.query(`DROP TABLE \`category_values\``);
        await queryRunner.query(`DROP INDEX \`UQ_dimension_user_name\` ON \`category_dimensions\``);
        await queryRunner.query(`DROP INDEX \`IDX_dimension_sort\` ON \`category_dimensions\``);
        await queryRunner.query(`DROP TABLE \`category_dimensions\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeentry_user_localdate\` ON \`time_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeentry_user_startedAt\` ON \`time_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeentry_user_template\` ON \`time_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeentry_user_running\` ON \`time_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_timeentry_user_week\` ON \`time_entries\``);
        await queryRunner.query(`DROP TABLE \`time_entries\``);
        await queryRunner.query(`DROP INDEX \`UQ_tasktemplate_user_name\` ON \`task_templates\``);
        await queryRunner.query(`DROP INDEX \`IDX_tasktemplate_quickstart\` ON \`task_templates\``);
        await queryRunner.query(`DROP INDEX \`IDX_tasktemplate_archived\` ON \`task_templates\``);
        await queryRunner.query(`DROP TABLE \`task_templates\``);
        await queryRunner.query(`DROP INDEX \`IDX_user_email_unique\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
    }

}
