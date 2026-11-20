CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" uuid NOT NULL,
	"worker_id" text,
	"source_id" uuid,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"message" text NOT NULL,
	"occurred_at" timestamp (3) with time zone NOT NULL,
	"acknowledged_at" timestamp (3) with time zone,
	CONSTRAINT "alerts_type_check" CHECK ("alerts"."type" in ('proximity', 'ppe_violation', 'fatigue', 'fall', 'temperature', 'gas_leak')),
	CONSTRAINT "alerts_severity_check" CHECK ("alerts"."severity" in ('critical', 'high', 'medium', 'low')),
	CONSTRAINT "alerts_message_nonblank_check" CHECK ("alerts"."message" ~ '[^[:space:]]')
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"worker_id" text,
	"role_at_occurrence" text,
	"occurred_on" date NOT NULL,
	"shift" text,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"description" text,
	"weather" text,
	"temperature_c" double precision,
	"ppe_ok" boolean,
	CONSTRAINT "incidents_shift_check" CHECK ("incidents"."shift" in ('morning', 'afternoon', 'night')),
	CONSTRAINT "incidents_severity_check" CHECK ("incidents"."severity" in ('critical', 'high', 'medium', 'low')),
	CONSTRAINT "incidents_role_requires_worker_check" CHECK ("incidents"."role_at_occurrence" is null or "incidents"."worker_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "ppe_checks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"worker_id" text NOT NULL,
	"site_id" uuid NOT NULL,
	"checked_at" timestamp (3) with time zone NOT NULL,
	"helmet" boolean,
	"vest" boolean,
	"gloves" boolean,
	"glasses" boolean,
	"shoes" boolean,
	CONSTRAINT "ppe_checks_observed_item_check" CHECK (num_nonnulls("ppe_checks"."helmet", "ppe_checks"."vest", "ppe_checks"."gloves", "ppe_checks"."glasses", "ppe_checks"."shoes") > 0)
);
--> statement-breakpoint
CREATE TABLE "sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"site_id" uuid NOT NULL,
	"worker_id" text,
	"metric" text NOT NULL,
	"value" double precision NOT NULL,
	"observed_at" timestamp (3) with time zone NOT NULL,
	CONSTRAINT "sensor_readings_finite_check" CHECK ("sensor_readings"."value" > '-Infinity'::double precision and "sensor_readings"."value" < 'Infinity'::double precision),
	CONSTRAINT "sensor_readings_metric_range_check" CHECK (case "sensor_readings"."metric"
    when 'heart_rate_bpm' then "sensor_readings"."value" > 0 and "sensor_readings"."worker_id" is not null
    when 'battery_pct' then "sensor_readings"."value" between 0 and 100
    when 'ambient_temperature_c' then true
    when 'co_ppm' then "sensor_readings"."value" >= 0
    else false
  end)
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"time_zone" text DEFAULT 'UTC' NOT NULL,
	CONSTRAINT "sites_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_id" uuid NOT NULL,
	"worker_id" text,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"last_seen_at" timestamp (3) with time zone,
	CONSTRAINT "sources_kind_check" CHECK ("sources"."kind" in ('wearable', 'environment', 'robot')),
	CONSTRAINT "sources_worker_wearable_check" CHECK ("sources"."worker_id" is null or "sources"."kind" = 'wearable')
);
--> statement-breakpoint
CREATE TABLE "workers" (
	"id" text PRIMARY KEY NOT NULL,
	"site_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"zone_label" text
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_checks" ADD CONSTRAINT "ppe_checks_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppe_checks" ADD CONSTRAINT "ppe_checks_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workers" ADD CONSTRAINT "workers_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alerts_order_idx" ON "alerts" USING btree ("occurred_at" DESC NULLS LAST,"id");--> statement-breakpoint
CREATE INDEX "alerts_site_time_idx" ON "alerts" USING btree ("site_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "incidents_site_date_idx" ON "incidents" USING btree ("site_id","occurred_on" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "incidents_worker_date_idx" ON "incidents" USING btree ("worker_id","occurred_on" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ppe_checks_worker_time_idx" ON "ppe_checks" USING btree ("worker_id","checked_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ppe_checks_site_time_idx" ON "ppe_checks" USING btree ("site_id","checked_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "sensor_readings_source_metric_time_idx" ON "sensor_readings" USING btree ("source_id","metric","observed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "sensor_readings_worker_metric_time_idx" ON "sensor_readings" USING btree ("worker_id","metric","observed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "sources_assigned_worker_uidx" ON "sources" USING btree ("worker_id") WHERE "sources"."worker_id" is not null;--> statement-breakpoint
CREATE INDEX "sources_site_idx" ON "sources" USING btree ("site_id");--> statement-breakpoint
CREATE INDEX "workers_site_idx" ON "workers" USING btree ("site_id");