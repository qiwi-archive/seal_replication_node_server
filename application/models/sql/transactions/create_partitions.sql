DO
$$
DECLARE
    flow_codes CURSOR FOR
        SELECT DISTINCT pflow_code
        FROM sys_pay_flow;
    tableName varchar;
    triggerStr varchar;
BEGIN
triggerStr := '';
FOR flow IN flow_codes LOOP
	tableName := lower('aggr_bills_' || flow.pflow_code);
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I ( CHECK ( pflow_code = %L) ) INHERITS (aggr_bills);', tableName, flow.pflow_code);
    EXECUTE createIndexIfNotExists('CREATE UNIQUE INDEX IF NOT EXISTS %I ON %I (bills_uniq_key);', format('idx_%I_uniq', tableName), tableName);
    EXECUTE createIndexIfNotExists('CREATE INDEX IF NOT EXISTS %I ON %I (id_prv, bills_add_timestamp);', format('idx_%I_id_prv_timestamp', tableName), tableName);
    EXECUTE createIndexIfNotExists('CREATE INDEX IF NOT EXISTS %I ON %I (id_pay_flow, bills_add_timestamp, id_prv);', format('idx_%I_id_flow_timestamp', tableName), tableName);
    EXECUTE createIndexIfNotExists('CREATE INDEX IF NOT EXISTS %I ON %I (bills_add_timestamp, id_pay_flow);', format('idx_%I_timestamp_id_flow', tableName), tableName);
    IF triggerStr = '' THEN triggerStr := 'IF '; ELSE triggerStr := triggerStr || 'ELSIF '; END IF;
    triggerStr := triggerStr || format('(NEW.pflow_code = ''%L'') THEN INSERT INTO %I VALUES(NEW.*); ', flow.pflow_code, tableName);
  END LOOP;
  triggerStr := 'CREATE OR REPLACE FUNCTION aggr_bills_insert_trigger_function() RETURNS TRIGGER AS '' BEGIN ' || triggerStr;
  triggerStr := triggerStr || 'ELSE RAISE EXCEPTION ''''UNKNOWN FLOW CODE''''; END IF; RETURN NULL; END; '' LANGUAGE plpgsql;';
  EXECUTE 'DROP TRIGGER IF EXISTS aggr_bills_insert_trigger ON aggr_bills;';
  EXECUTE triggerStr;
  EXECUTE 'CREATE TRIGGER aggr_bills_insert_trigger BEFORE INSERT ON aggr_bills FOR EACH ROW EXECUTE PROCEDURE aggr_bills_insert_trigger_function();';
  END;
$$ LANGUAGE plpgsql;