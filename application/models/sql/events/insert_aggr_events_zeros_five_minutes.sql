WITH flows AS(
	SELECT
		id_events_flow,
		eflow_code
	FROM
		sys_events_flow
	WHERE
		eflow_code = {{flowCodeQuoted}}
		AND eflow_time_code = {{timeCodeQuoted}}
		AND eflow_add_zeros = 1
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
dates AS(
	SELECT
    	date_timestamp::TIMESTAMP,
    	EXTRACT (EPOCH FROM date_timestamp - date_trunc('day', date_timestamp)) / 5 / 60 + 1 AS add_section
    FROM
    	generate_series(
    		date_trunc('minute', now())::timestamp - ((EXTRACT(MINUTE from now())::integer % 5) * INTERVAL '1 minute') - INTERVAL '{{hoursInterval}} hours',
    		NOW() - INTERVAL '5 minutes',
    		INTERVAL '5 minutes'
    	) date_timestamp
) INSERT
	INTO
		{{partitionName}}(
			events_add_section,
			events_add_timestamp,
			events_count,
			id_prv,
			id_events_flow,
			events_uniq_key,
			eflow_code
		)(
			SELECT
				dates.add_section,
				dates.date_timestamp,
				0,
				providers.id_prv,
				flows.id_events_flow,
				md5(
					CAST(
						(
							dates.date_timestamp,
				            dates.add_section,
							providers.id_prv,
							flows.id_events_flow
						) AS TEXT
					)
				),
				flows.eflow_code
			FROM
				flows,
				providers,
				dates
			WHERE
				EXISTS(
					SELECT
						1
					FROM
						aggr_events
					WHERE
						aggr_events.eflow_code = flows.eflow_code
						AND aggr_events.id_events_flow = flows.id_events_flow
						AND aggr_events.id_prv = providers.id_prv
						AND aggr_events.events_add_timestamp >= date_trunc( 'day', NOW() ) - INTERVAL '{{hoursInterval}} hours'
					LIMIT 1
				)
		) ON CONFLICT (events_uniq_key) DO NOTHING;
	