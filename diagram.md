

```mermaid
erDiagram

    USER {
      UUID id
      string email
      string displayName
      string timezone
      datetime createdAt
      datetime updatedAt
    }

    TASK_TEMPLATE {
      UUID id
      UUID userId
      string name
      string description
      boolean isQuickStart
      boolean isArchived
      int defaultDurationEstimateMinutes
      datetime createdAt
      datetime updatedAt
    }

    TIME_ENTRY {
      UUID id
      UUID userId
      UUID taskTemplateId
      string titleOverride
      string notes
      datetime startedAt
      datetime endedAt
      int durationSeconds
      boolean isRunning
      date localDate
      int year
      int month
      int weekOfYear
      int dayOfWeek
      datetime createdAt
      datetime updatedAt
    }

    CATEGORY_DIMENSION {
      UUID id
      UUID userId
      string name
      string description
      boolean isSystem
      int sortOrder
      datetime createdAt
      datetime updatedAt
    }

    CATEGORY_VALUE {
      UUID id
      UUID userId
      UUID dimensionId
      UUID parentId
      string label
      string code
      string color
      boolean isArchived
      int sortOrder
      datetime createdAt
      datetime updatedAt
    }

    TASK_TEMPLATE_CATEGORY {
      UUID id
      UUID taskTemplateId
      UUID categoryValueId
      datetime createdAt
    }

    TIME_ENTRY_CATEGORY {
      UUID id
      UUID timeEntryId
      UUID categoryValueId
      datetime createdAt
    }

    TIME_AGGREGATE {
      UUID id
      UUID userId
      string bucketType
      date bucketStart
      UUID taskTemplateId
      UUID categoryValueId
      int totalDurationSeconds
      int entryCount
      datetime lastComputedAt
    }

    %% Relationships

    USER ||--o{ TASK_TEMPLATE : "owns"
    USER ||--o{ TIME_ENTRY : "owns"
    USER ||--o{ CATEGORY_DIMENSION : "defines"
    USER ||--o{ CATEGORY_VALUE : "defines"
    USER ||--o{ TIME_AGGREGATE : "aggregates for"

    TASK_TEMPLATE }o--o{ TIME_ENTRY : "used by (optional)"
    TASK_TEMPLATE ||--o{ TASK_TEMPLATE_CATEGORY : "tagged with"
    TIME_ENTRY ||--o{ TIME_ENTRY_CATEGORY : "tagged with"

    CATEGORY_DIMENSION ||--o{ CATEGORY_VALUE : "has values"

    CATEGORY_VALUE ||--o{ TASK_TEMPLATE_CATEGORY : "applied to templates"
    CATEGORY_VALUE ||--o{ TIME_ENTRY_CATEGORY : "applied to entries"

    CATEGORY_VALUE ||--o{ CATEGORY_VALUE : "parent/child (within dimension)"

    TASK_TEMPLATE ||--o{ TIME_AGGREGATE : "summarized in (optional)"
    CATEGORY_VALUE ||--o{ TIME_AGGREGATE : "summarized in (optional)"
