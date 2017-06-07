COPY {{tableName}}(
			prv_db,
			id_prv,
			prv_name,
			prs_manager,
			prv_type,
			accept_status_id,
			accept_status,
			shema,
			agregator,
			prv_global_name,
			prv_merch_name,
			prv_mrkt_name,
			prv_mrkt_sub_name,
			replication_start_date
		)
	FROM STDIN WITH QUOTE AS E'\x1f' CSV