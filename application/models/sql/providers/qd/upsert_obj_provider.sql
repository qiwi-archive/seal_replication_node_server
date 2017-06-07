INSERT
	INTO
		obj_provider(
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
			prv_mrkt_sub_name
		)(
			SELECT
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
                    prv_mrkt_sub_name
			FROM
				{{tableName}}
		) ON CONFLICT (id_prv) DO UPDATE SET 
                     prv_db = EXCLUDED.prv_db,
                     id_prv = EXCLUDED.id_prv,
                     prv_name = EXCLUDED.prv_name,
                     prs_manager = EXCLUDED.prs_manager,
                     prv_type = EXCLUDED.prv_type,
                     accept_status_id = EXCLUDED.accept_status_id,
                     accept_status = EXCLUDED.accept_status,
                     shema = EXCLUDED.shema,
                     agregator = EXCLUDED.agregator,
                     prv_global_name = EXCLUDED.prv_global_name,
                     prv_merch_name = EXCLUDED.prv_merch_name,
                     prv_mrkt_name = EXCLUDED.prv_mrkt_name,
                     prv_mrkt_sub_name = EXCLUDED.prv_mrkt_sub_name