INSERT
	INTO
		obj_provider(
			prv_db,
			id_prv,
			prv_name
		)(
			SELECT
				DISTINCT {{providerDbQuoted}},
				id_prv,
				'UNKNOWN'
			FROM
				{{tableName}}
			WHERE
				NOT EXISTS(
					SELECT
						id_prv
					FROM
						obj_provider
					WHERE
						obj_provider.id_prv = {{tableName}}.id_prv
				)
		) RETURNING 1