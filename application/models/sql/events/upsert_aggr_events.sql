INSERT
	INTO
		{{partitionName}}(
			id_prv,
			events_add_section,
			events_add_timestamp,
			events_count,
			events_uniq_key,
			id_events_flow,
			eflow_code
		)(
			SELECT
                id_prv,
			    events_add_section,
                events_add_timestamp,
                events_count,
                events_uniq_key,
                id_events_flow,
                eflow_code
			FROM
				{{tableName}}
		) ON CONFLICT (events_uniq_key)
		DO UPDATE SET events_count = EXCLUDED.events_count