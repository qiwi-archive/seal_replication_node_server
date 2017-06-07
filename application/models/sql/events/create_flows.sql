INSERT
	INTO
		sys_events_flow(
			eflow_code,
			eflow_time_code,
			eflow_node,
			eflow_action,
			eflow_category,
			eflow_uniq_key,
			eflow_add_zeros
		) SELECT
			DISTINCT {{tableName}}.eflow_code,
			{{tableName}}.eflow_time_code,
			{{tableName}}.eflow_node,
			{{tableName}}.eflow_action,
			{{tableName}}.eflow_category,
			md5(
				CAST(
					(
						{{tableName}}.eflow_code,
                        {{tableName}}.eflow_time_code,
                        {{tableName}}.eflow_node,
                        {{tableName}}.eflow_action,
                        {{tableName}}.eflow_category
					) AS TEXT
				)
			),
            {{addZeros}}
		FROM
			{{tableName}}
		WHERE
			NOT EXISTS(
				SELECT
					1
				FROM
					sys_events_flow
				WHERE
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
							)
					) RETURNING 1