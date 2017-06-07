DO
$$
DECLARE
    flow_codes CURSOR FOR
        SELECT DISTINCT eflow_code
        FROM sys_events_flow;
    tableName varchar;
    triggerStr varchar;
BEGIN
triggerStr := '';
FOR flow IN flow_codes LOOP
	tableName := lower('aggr_events_' || flow.eflow_code);
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I ( CHECK ( eflow_code = %L) ) INHERITS (aggr_events);', tableName, flow.eflow_code);
    EXECUTE createIndexIfNotExists('CREATE UNIQUE INDEX IF NOT EXISTS %I ON %I (events_uniq_key);', format('idx_%I_uniq', tableName), tableName);
    EXECUTE createIndexIfNotExists('CREATE INDEX IF NOT EXISTS %I ON %I (id_prv, events_add_timestamp);', format('idx_%I_id_prv_timestamp', tableName), tableName);
    EXECUTE createIndexIfNotExists('CREATE INDEX IF NOT EXISTS %I ON %I (id_events_flow, events_add_timestamp, id_prv);', format('idx_%I_id_flow_timestamp', tableName), tableName);
    EXECUTE createIndexIfNotExists('CREATE INDEX IF NOT EXISTS %I ON %I (events_add_timestamp, id_events_flow);', format('idx_%I_timestamp_id_flow', tableName), tableName);
    IF triggerStr = '' THEN triggerStr := 'IF '; ELSE triggerStr := triggerStr || 'ELSIF '; END IF;
    triggerStr := triggerStr || format('(NEW.eflow_code = ''%L'') THEN INSERT INTO %I VALUES(NEW.*); ', flow.eflow_code, tableName);
  END LOOP;
  triggerStr := 'CREATE OR REPLACE FUNCTION aggr_events_insert_trigger_function() RETURNS TRIGGER AS '' BEGIN ' || triggerStr;
  triggerStr := triggerStr || 'ELSE RAISE EXCEPTION ''''UNKNOWN FLOW CODE''''; END IF; RETURN NULL; END; '' LANGUAGE plpgsql;';
  EXECUTE 'DROP TRIGGER IF EXISTS aggr_events_insert_trigger ON aggr_events;';
  EXECUTE triggerStr;
  EXECUTE 'CREATE TRIGGER aggr_events_insert_trigger BEFORE INSERT ON aggr_events FOR EACH ROW EXECUTE PROCEDURE aggr_events_insert_trigger_function();';
  END;
$$ LANGUAGE plpgsql;