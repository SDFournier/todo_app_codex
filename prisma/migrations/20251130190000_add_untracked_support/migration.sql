-- Add system/untracked flags to templates
ALTER TABLE `task_templates`
  ADD COLUMN `isSystem` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `isUntracked` BOOLEAN NOT NULL DEFAULT false;

-- Flag time entries that represent the untracked fallback
ALTER TABLE `time_entries`
  ADD COLUMN `isUntracked` BOOLEAN NOT NULL DEFAULT false;

-- Flag category values that represent the untracked bucket
ALTER TABLE `category_values`
  ADD COLUMN `isUntracked` BOOLEAN NOT NULL DEFAULT false;
