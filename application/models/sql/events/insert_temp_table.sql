COPY {{tableName}}(
		    id_prv,
            events_add_section,
            events_add_timestamp,
            eflow_node,
            eflow_action,
            eflow_category,
            events_count,
            eflow_time_code,
            eflow_code
		)
	FROM STDIN WITH QUOTE AS E'\x1f' CSV