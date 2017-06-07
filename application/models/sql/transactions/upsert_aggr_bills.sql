INSERT
	INTO
		{{partitionName}}(
			bills_add_section,
			bills_add_timestamp,
			bills_original_amount,
			bills_amount,
			bills_payments_amount,
			bills_paid_amount,
			bills_count,
			bills_paid_count,
			bills_payments_count,
			id_prv,
			bills_pay_seconds,
			id_pay_flow,
			bills_uniq_key,
			pflow_code
		)(
			SELECT
				bills_add_section,
				bills_add_timestamp,
				bills_original_amount,
				bills_amount,
				bills_payments_amount,
                bills_paid_amount,
                bills_count,
                bills_paid_count,
                bills_payments_count,
				id_prv,
				bills_pay_seconds,
				id_pay_flow,
				bills_uniq_key,
				pflow_code
			FROM
				{{tableName}}
		)
		ON CONFLICT (bills_uniq_key) DO UPDATE
		SET
            bills_count = EXCLUDED.bills_count,
            bills_payments_count = EXCLUDED.bills_payments_count,
            bills_paid_count = EXCLUDED.bills_paid_count,
            bills_original_amount = EXCLUDED.bills_original_amount,
            bills_amount = EXCLUDED.bills_amount,
            bills_paid_amount = EXCLUDED.bills_paid_amount,
            bills_payments_amount = EXCLUDED.bills_payments_amount,
            bills_pay_seconds = EXCLUDED.bills_pay_seconds