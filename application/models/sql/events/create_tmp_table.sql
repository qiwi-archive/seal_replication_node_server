CREATE UNLOGGED TABLE IF NOT EXISTS {{tableName}} (
    id_events int4 NOT NULL DEFAULT nextval('aggr_events_id_events_seq'::regclass),
	id_prv varchar NULL,
	events_add_section int4 NULL,
	events_add_timestamp timestamp NULL,
	eflow_node varchar NULL,
	eflow_action varchar NULL,
	eflow_category varchar NULL,
	events_count int4 NOT NULL,
	eflow_time_code varchar NOT NULL,
	eflow_code varchar NOT NULL,
	eflow_uniq_key varchar,
	id_events_flow int4,
	events_uniq_key varchar
);