UPDATE sys_pay_flow
SET pflow_add_zeros = 1 WHERE
id_pay_flow IN (
    SELECT id_pay_flow
    FROM spr_tags
    INNER JOIN rel_flow_tags ON rel_flow_tags.id_tag = spr_tags.id_tag
    WHERE spr_tags.tag_monitoring_enabled = true
);
WITH flows AS(
	SELECT
		id_pay_flow,
		pflow_code
	FROM
		sys_pay_flow
	WHERE
		pflow_code = {{flowCodeQuoted}}
		AND pflow_time_code = {{timeCodeQuoted}}
		AND pflow_add_zeros = 1
),
providers AS(
	SELECT
		DISTINCT id_prv
	FROM
		spr_tags
	INNER JOIN rel_prv_tags ON
		rel_prv_tags.id_tag = spr_tags.id_tag
	WHERE
		tag_code = 'ADD_ZEROS_MONITOR'
),
replication_log AS (
    SELECT
        replication_start_date
     FROM {{tableName}}
     LIMIT 1
),
dates AS(
	SELECT
    	date_timestamp::TIMESTAMP,
    	EXTRACT (EPOCH FROM date_timestamp - date_trunc('day', date_timestamp)) / 5 / 60 + 1 AS add_section
    FROM
    	generate_series(
    		date_trunc('minute', (SELECT replication_start_date FROM replication_log))::timestamp - ((extract(MINUTE from (SELECT replication_start_date FROM replication_log))::integer % 5) * INTERVAL '1 minute') - INTERVAL '{{hoursInterval}} hours',
    		(SELECT replication_start_date FROM replication_log) - INTERVAL '5 minutes',
    		INTERVAL '5 minutes'
    	) date_timestamp
) INSERT
	INTO
		{{partitionName}}(
			bills_add_section,
			bills_add_timestamp,
			bills_original_amount,
			bills_amount,
			bills_payments_amount,
			bills_paid_amount,
			bills_count,
			bills_paid_count,
			bills_payments_count,
			id_prv,
			bills_pay_seconds,
			id_pay_flow,
			bills_uniq_key,
			pflow_code
		)(
			SELECT
				dates.add_section,
				dates.date_timestamp,
				0,
				0,
				0,
				0,
				0,
				0,
				0,
				providers.id_prv,
				0,
				flows.id_pay_flow,
				md5(
					CAST(
						(
							dates.date_timestamp,
				            dates.add_section,
							providers.id_prv,
							flows.id_pay_flow
						) AS TEXT
					)
				),
				flows.pflow_code
			FROM
				flows,
				providers,
				dates
			WHERE
				EXISTS(
					SELECT
						1
					FROM
						aggr_bills
					WHERE
						aggr_bills.pflow_code = flows.pflow_code
						AND aggr_bills.id_pay_flow = flows.id_pay_flow
						AND aggr_bills.id_prv = providers.id_prv
						AND aggr_bills.bills_add_timestamp >= date_trunc( 'day', (SELECT replication_start_date FROM replication_log) ) - INTERVAL '{{hoursInterval}} hours'
					LIMIT 1
				)
		) ON CONFLICT (bills_uniq_key) DO NOTHING;
	