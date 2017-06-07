INSERT INTO sys_replication_log
(
    replication_code,
    replication_start_date,
    replication_end_date,
    replication_max_date,
    replication_days_interval
)
(
     SELECT
        {{replicationTypeQuoted}},
        replication_start_date,
        now(),
        now(),
        0
     FROM {{tableName}}
     WHERE replication_start_date IS NOT NULL
     GROUP BY replication_start_date
);
DROP TABLE IF EXISTS {{tableName}};