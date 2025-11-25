CREATE TABLE "consignee_master" (
	"consignee_id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"name" varchar(200),
	"address_line1" varchar(200),
	"address_line2" varchar(200),
	"city" varchar(100),
	"district" varchar(100),
	"state" varchar(100),
	"pincode" varchar(20),
	"contact_no" varchar(30),
	"tin_no" varchar(50),
	"gst_no" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "consignment_details" (
	"consignment_id" integer PRIMARY KEY NOT NULL,
	"risk_type" varchar(50),
	"owner" varchar(100),
	"linfox_vendor_code" varchar(100),
	"type_of_cnote" varchar(50),
	"vhc_no" varchar(50),
	"vehicle_no" varchar(50),
	"shipment_no" varchar(50),
	"packaging_type" varchar(50),
	"weight" numeric(10, 3),
	"said_to_contain" varchar(200),
	"vehicle_type" varchar(50),
	"special_instructions" text,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "consignment_note" (
	"consignment_id" serial PRIMARY KEY NOT NULL,
	"consignor_id" integer NOT NULL,
	"consignee_id" integer NOT NULL,
	"vehicle_id" integer,
	"driver_id" integer,
	"cnote_no" varchar(50) NOT NULL,
	"booking_date" date,
	"cnote_entry_date" date,
	"esd_date" date,
	"payment_type" varchar(50),
	"billing_party" varchar(100),
	"from_location" varchar(100),
	"to_location" varchar(100),
	"transport_mode" varchar(50),
	"service_type" varchar(50),
	"entered_by" varchar(100),
	"total_charged_weight" numeric(10, 3),
	"import_permit_no" varchar(50),
	"export_permit_no" varchar(50),
	"transport_permit_no" varchar(50),
	"eway_bill_no" varchar(50),
	"addl_tax_invoice_no" varchar(50),
	"manual_lr_no" varchar(50),
	"is_insured" boolean DEFAULT false,
	"created_at" date DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consignor_master" (
	"consignor_id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50),
	"name" varchar(200),
	"address_line1" varchar(200),
	"address_line2" varchar(200),
	"city" varchar(100),
	"district" varchar(100),
	"state" varchar(100),
	"pincode" varchar(20),
	"contact_no" varchar(30),
	"tin_no" varchar(50),
	"gst_no" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "driver_master" (
	"driver_id" serial PRIMARY KEY NOT NULL,
	"driver_name" varchar(200) NOT NULL,
	"mobile_no" varchar(20),
	"license_no" varchar(50),
	"license_validity" date,
	"address" text,
	"aadhaar_no" varchar(20),
	"active" boolean DEFAULT true,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"invoice_line_id" serial PRIMARY KEY NOT NULL,
	"consignment_id" integer NOT NULL,
	"sno" integer,
	"invoice_no" varchar(50),
	"no_of_pages" integer,
	"invoice_date" date,
	"invoice_value_rs" numeric(14, 2),
	"no_of_cases" integer,
	"no_of_units" integer,
	"actual_weight_t" numeric(10, 3),
	"charged_weight_t" numeric(10, 3)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vehicle_master" (
	"vehicle_id" serial PRIMARY KEY NOT NULL,
	"vehicle_no" varchar(50) NOT NULL,
	"vehicle_type" varchar(50),
	"registration_date" date,
	"capacity_tons" numeric(10, 3),
	"owner_party_id" integer,
	"active" boolean DEFAULT true,
	"remarks" text
);
--> statement-breakpoint
ALTER TABLE "consignment_details" ADD CONSTRAINT "consignment_details_consignment_id_consignment_note_consignment_id_fk" FOREIGN KEY ("consignment_id") REFERENCES "public"."consignment_note"("consignment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_note" ADD CONSTRAINT "consignment_note_consignor_id_consignor_master_consignor_id_fk" FOREIGN KEY ("consignor_id") REFERENCES "public"."consignor_master"("consignor_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_note" ADD CONSTRAINT "consignment_note_consignee_id_consignee_master_consignee_id_fk" FOREIGN KEY ("consignee_id") REFERENCES "public"."consignee_master"("consignee_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_note" ADD CONSTRAINT "consignment_note_vehicle_id_vehicle_master_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle_master"("vehicle_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consignment_note" ADD CONSTRAINT "consignment_note_driver_id_driver_master_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver_master"("driver_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_consignment_id_consignment_note_consignment_id_fk" FOREIGN KEY ("consignment_id") REFERENCES "public"."consignment_note"("consignment_id") ON DELETE no action ON UPDATE no action;