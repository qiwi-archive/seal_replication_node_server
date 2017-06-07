INSERT
	INTO
		sys_pay_flow(
			pflow_code,
			pflow_time_code,
			pflow_api,
			pflow_client,
			pflow_source,
            pflow_currency,
            pflow_billref,
			pflow_uniq_key,
			pflow_add_zeros
		) SELECT
			DISTINCT {{tableName}}.pflow_code,
			{{tableName}}.pflow_time_code,
			{{tableName}}.pflow_api,
			{{tableName}}.pflow_client,
			{{tableName}}.pflow_source,
            {{tableName}}.pflow_currency,
           	{{tableName}}.pflow_billref,
			md5(
				CAST(
					(
						{{tableName}}.pflow_code,
						{{tableName}}.pflow_time_code,
						{{tableName}}.pflow_api,
						{{tableName}}.pflow_client,
						{{tableName}}.pflow_source,
						{{tableName}}.pflow_currency,
						{{tableName}}.pflow_billref
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
					sys_pay_flow
				WHERE
					pflow_uniq_key = md5(
								CAST(
									(
										{{tableName}}.pflow_code,
										{{tableName}}.pflow_time_code,
										{{tableName}}.pflow_api,
										{{tableName}}.pflow_client,
										{{tableName}}.pflow_source,
                                        {{tableName}}.pflow_currency,
                                        {{tableName}}.pflow_billref
									) AS TEXT
								)
							)
					) RETURNING 1