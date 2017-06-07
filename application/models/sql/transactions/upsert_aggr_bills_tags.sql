INSERT
    INTO
        aggr_bills_tags(
            id_tag,
            bills_add_timestamp,
            bills_add_section,
            bills_count,
            bills_paid_count,
            bills_amount,
            bills_paid_amount,
            bills_payments_count,
            bills_payments_amount,
            bills_pay_seconds
        ) SELECT
            id_tag,
            bills_add_timestamp,
            bills_add_section,
            bills_count,
            bills_paid_count,
            bills_amount,
            bills_paid_amount,
            bills_payments_count,
            bills_payments_amount,
            bills_pay_seconds
        FROM
            v_aggr_bills_tags
            WHERE bills_add_timestamp > (SELECT replication_start_date FROM {{tableName}} LIMIT 1) - INTERVAL '{{hoursInterval}} hours'
        ON CONFLICT (id_tag, bills_add_timestamp) DO UPDATE SET
        id_tag = EXCLUDED.id_tag,
        bills_add_timestamp = EXCLUDED.bills_add_timestamp,
        bills_add_section = EXCLUDED.bills_add_section,
        bills_count = EXCLUDED.bills_count,
        bills_paid_count = EXCLUDED.bills_paid_count,
        bills_amount = EXCLUDED.bills_amount,
        bills_paid_amount = EXCLUDED.bills_paid_amount,
        bills_payments_count = EXCLUDED.bills_payments_count,
        bills_payments_amount = EXCLUDED.bills_payments_amount,
        bills_pay_seconds = EXCLUDED.bills_pay_seconds;
WITH
replication_log AS (
    SELECT
        replication_start_date - interval '5 minutes' as replication_start_date
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
		aggr_bills_tags(
			bills_add_section,
			bills_add_timestamp,
			bills_amount,
			bills_payments_amount,
			bills_paid_amount,
			bills_count,
			bills_paid_count,
			bills_payments_count,
			id_tag,
			bills_pay_seconds
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
				spr_tags.id_tag,
				0
			FROM
				dates, spr_tags
			WHERE
			spr_tags.tag_monitoring_enabled = true
		) ON CONFLICT (id_tag, bills_add_timestamp) DO NOTHING;