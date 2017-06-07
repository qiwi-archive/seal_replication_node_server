UPDATE
	{{tableName}}
SET
	id_prv = {{idProviderTransform}},
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
	);
UPDATE
	{{tableName}}
SET
	id_pay_flow =(
		SELECT
			sys_pay_flow.id_pay_flow
		FROM
			sys_pay_flow
		WHERE
			sys_pay_flow.pflow_uniq_key = {{tableName}}.pflow_uniq_key
		LIMIT 1
	),
	bills_uniq_key = md5(
     		CAST(
     			(
     				{{tableName}}.bills_add_timestamp,
     				{{tableName}}.bills_add_section,
     				{{tableName}}.id_prv,
     				(
     				    SELECT
                     			sys_pay_flow.id_pay_flow
                     		FROM
                     			sys_pay_flow
                     		WHERE
                     			sys_pay_flow.pflow_uniq_key = {{tableName}}.pflow_uniq_key
		                LIMIT 1
                     )
     			) AS TEXT
     		)
     	)
RETURNING 1;