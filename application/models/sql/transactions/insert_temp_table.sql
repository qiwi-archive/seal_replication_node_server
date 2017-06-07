COPY {{tableName}}(
			bills_add_section,
			bills_add_timestamp,
			id_prv,
			pflow_currency,
			bills_original_amount,
			bills_amount,
			bills_payments_amount,
			bills_paid_amount,
			bills_count,
			bills_paid_count,
			bills_payments_count,
			pflow_time_code,
			bills_pay_seconds,
			pflow_code,
			replication_start_date,
			replication_last_add_date
		)
	FROM STDIN WITH QUOTE AS E'\x1f' CSV

