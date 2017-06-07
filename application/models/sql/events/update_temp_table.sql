UPDATE
	{{tableName}}
SET
    events_add_timestamp = events_add_timestamp - interval '3 hours',
	id_prv = {{idProviderTransform}},
	eflow_uniq_key = md5(
		CAST(
			(
				{{tableName}}.eflow_code,
				{{tableName}}.eflow_time_code,
				{{tableName}}.eflow_node,
				{{tableName}}.eflow_action,
				{{tableName}}.eflow_category
			) AS TEXT
		)
	);
UPDATE
	{{tableName}}
SET
	id_events_flow =(
		SELECT
			sys_events_flow.id_events_flow
		FROM
			sys_events_flow
		WHERE
			sys_events_flow.eflow_uniq_key = {{tableName}}.eflow_uniq_key
		LIMIT 1
	),
	events_uniq_key = md5(
     		CAST(
     			(
     				{{tableName}}.events_add_timestamp,
     				{{tableName}}.events_add_section,
     				{{tableName}}.id_prv,
     				(
     				    SELECT
                        	sys_events_flow.id_events_flow
                        FROM
                        	sys_events_flow
                        WHERE
                        	sys_events_flow.eflow_uniq_key = {{tableName}}.eflow_uniq_key
                        LIMIT 1
                     )
     			) AS TEXT
     		)
     	)
RETURNING 1;