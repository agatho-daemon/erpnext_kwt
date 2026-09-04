import {
  apply_kuwait_address_labels,
  compose_kuwait_address,
  get_default_country,
  get_quick_entry_address_fields,
  is_kuwait,
} from "./kwt_address_utils.js";

frappe.provide("frappe.ui.form");

const NativePartyQuickEntryForm = frappe.ui.form.ContactAddressQuickEntryForm;

class KuwaitPartyQuickEntryForm extends NativePartyQuickEntryForm {
  render_dialog() {
    this.add_arabic_name_field();
    this.add_customer_unit_paci_field();
    super.render_dialog();
    this.configure_country_field();
    this.configure_geography_fields();
  }

  add_customer_unit_paci_field() {
    if (
      this.doctype !== "Customer" ||
      this.docfields.some((field) => field.fieldname === "custom_paci")
    ) {
      return;
    }

    const arabic_name_index = this.docfields.findIndex(
      (field) => field.fieldname === "custom_arabic_name"
    );
    const customer_name_index = this.docfields.findIndex(
      (field) => field.fieldname === "customer_name"
    );
    const insert_after =
      arabic_name_index >= 0 ? arabic_name_index : customer_name_index;
    const insert_at =
      insert_after < 0 ? this.docfields.length : insert_after + 1;

    this.docfields.splice(insert_at, 0, {
      fieldname: "custom_paci",
      fieldtype: "Data",
      label: __("Unit PACI Number"),
      description: __(
        "Automated number identifying the customer's flat or unit."
      ),
    });
  }

  add_arabic_name_field() {
    if (
      this.docfields.some((field) => field.fieldname === "custom_arabic_name")
    ) {
      return;
    }

    const party_name_field =
      this.doctype === "Supplier" ? "supplier_name" : "customer_name";
    const party_name_index = this.docfields.findIndex(
      (field) => field.fieldname === party_name_field
    );
    const insert_at =
      party_name_index < 0 ? this.docfields.length : party_name_index + 1;

    this.docfields.splice(insert_at, 0, {
      fieldname: "custom_arabic_name",
      fieldtype: "Data",
      label: __("Arabic Name"),
    });
  }

  get_variant_fields() {
    return get_quick_entry_address_fields();
  }

  configure_country_field() {
    const country_field = this.fields_dict.country_address;
    if (!country_field) {
      return;
    }

    const original_onchange = country_field.df.onchange;
    country_field.df.onchange = () => {
      original_onchange?.call(country_field);
      const country = country_field.get_value();
      if (this.address_country && this.address_country !== country) {
        this.set_value("city", "");
        this.set_value("state", "");
      }
      this.address_country = country;
      this.refresh_kuwait_address_fields();
    };

    if (!country_field.get_value()) {
      country_field.set_value(get_default_country());
    }
    this.address_country = country_field.get_value();
    this.refresh_kuwait_address_fields();
  }

  configure_geography_fields() {
    const district_field = this.fields_dict.city;
    if (!district_field) {
      return;
    }

    district_field.get_query = () => ({
      filters: { country: this.get_value("country_address") || "" },
    });

    const original_onchange = district_field.df.onchange;
    district_field.df.onchange = async () => {
      original_onchange?.call(district_field);
      await this.set_governorate_from_district();
    };
  }

  async set_governorate_from_district() {
    const district = this.get_value("city");
    if (!district) {
      await this.set_value("state", "");
      return;
    }

    const { message } = await frappe.db.get_value("FUA City", district, [
      "country",
      "state",
    ]);
    if (!message) {
      frappe.msgprint(
        __("Geographic details were not found for district {0}.", [district])
      );
      return;
    }

    const country = this.get_value("country_address");
    if (message.country && country && message.country !== country) {
      frappe.msgprint(
        __("District {0} does not belong to the selected country.", [district])
      );
      await this.set_value("city", "");
      await this.set_value("state", "");
      return;
    }

    await this.set_value("state", message.state || "");
  }

  refresh_kuwait_address_fields() {
    apply_kuwait_address_labels(this, this.get_value("country_address"));
    this.refresh_dependency();
  }

  update_doc() {
    const country = this.get_value("country_address");
    const doc = super.update_doc();
    this.dialog.doc.middle_name = this.dialog.doc.map_to_middle_name;
    delete this.dialog.doc.map_to_middle_name;

    if (is_kuwait(country)) {
      const address = compose_kuwait_address(this.get_values(true));
      this.dialog.doc.address_line1 = address.address_line1;
      this.dialog.doc.address_line2 = address.address_line2;
    }

    this.remove_structured_address_fields();
    return doc;
  }

  remove_structured_address_fields() {
    ["block", "street", "lane", "building", "floor", "unit"].forEach(
      (fieldname) => {
        delete this.dialog.doc[fieldname];
      }
    );
  }
}

frappe.ui.form.CustomerQuickEntryForm = class KuwaitCustomerQuickEntryForm extends (
  KuwaitPartyQuickEntryForm
) {};

frappe.ui.form.SupplierQuickEntryForm = class KuwaitSupplierQuickEntryForm extends (
  KuwaitPartyQuickEntryForm
) {};
