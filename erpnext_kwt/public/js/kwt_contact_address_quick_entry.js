frappe.provide('frappe.ui.form');

const originalGetVariantFields = frappe.ui.form.ContactAddressQuickEntryForm.prototype.get_variant_fields;


// Override the get_variant_fields method for KWT format
frappe.ui.form.ContactAddressQuickEntryForm.prototype.get_variant_fields = function() {
        var variant_fields = [{
            fieldtype: "Section Break",
            label: __("Primary Contact Details"),
            collapsible: 1
        },
        {
            label: __("Email Id"),
            fieldname: "email_address",
            fieldtype: "Data",
            options: "Email"
        },
        {
            fieldtype: "Column Break"
        },
        {
            label: __("Mobile Number"),
            fieldname: "mobile_number",
            fieldtype: "Data"
        },
        {
            fieldtype: "Section Break",
            label: __("Primary Address Details"),
            collapsible: 1
        },
        {
            label: __("Country"),
            fieldname: "country",
            fieldtype: "Link",
            options: "Country",
            default: "Kuwait",
            reqd: 1
        },
        {
            label: __("Address Line 1"),
            fieldname: "address_line1",
            fieldtype: "Data",
            reqd: 1
        },
        {
            label: __("Address Line 2"),
            fieldname: "address_line2",
            fieldtype: "Data"
        },
        {
            fieldtype: "Column Break"
        },
        {
            label: __("District"),
            fieldname: "custom_district",
            fieldtype: "Link",
            options: "KWT District",
            reqd: 1,
            hidden: 0
        },
        {
            label: __("City/Town"),
            fieldname: "city",
            fieldtype: "Data",
            reqd: 1,
            hidden: 1
        },
        {
            label: __("Governorate"),
            fieldname: "state",
            fieldtype: "Data"
        },
        {
            label: __("PACI"),
            fieldname: "pincode",
            fieldtype: "Data"
        },
        {
            label: __("Customer POS Id"),
            fieldname: "customer_pos_id",
            fieldtype: "Data",
            hidden: 1
        }];
    
        return variant_fields;    
};

const originalRenderDialog = frappe.ui.form.ContactAddressQuickEntryForm.prototype.render_dialog;

frappe.ui.form.ContactAddressQuickEntryForm.prototype.render_dialog = function() {
    // Call original render_dialog
    originalRenderDialog.apply(this);

    // Attach onchange handler to country field
    if (this.dialog.fields_dict.country) {
        this.dialog.fields_dict.country.df.onchange = () => {
            this.country_changed();
        };
    }


    // Attach onchange handler to custom_district field
    if (this.dialog.fields_dict.custom_district) {
        this.dialog.fields_dict.custom_district.df.onchange = () => {
            this.custom_district_changed();
        };
    }
    // super.render_dialog();
};

frappe.ui.form.ContactAddressQuickEntryForm.prototype.custom_district_changed = function() {
    let custom_district_value = this.dialog.get_value('custom_district');
    if (custom_district_value) {
        // Fetch Governorate based on custom_district value
        frappe.db.get_value('KWT District', custom_district_value, 'governorate')
            .then(r => {
                if (r.message) {
                    // Set Governorate value
                    this.dialog.set_value('state', r.message.governorate);
                    // As well as hidden city field value
                    this.dialog.set_value('city', custom_district_value);
                    this.dialog.set_value('custom_district', custom_district_value);
                }
            });
    }
};

frappe.ui.form.ContactAddressQuickEntryForm.prototype.country_changed = function() {
    let country = this.dialog.get_value('country');

    // If country is NOT Kuwait, carry on changes
    if (country !== 'Kuwait') {
        this.dialog.set_df_property('custom_district', 'hidden', 1);
        this.dialog.set_df_property('city', 'hidden', 0);
        this.dialog.set_df_property('state', 'label', 'State/Province');
        this.dialog.set_df_property('pincode', 'label', 'Postal Code');
    }
};

const originalInsert = frappe.ui.form.ContactAddressQuickEntryForm.prototype.insert;
frappe.ui.form.ContactAddressQuickEntryForm.prototype.insert = function() {
    this.dialog.doc['custom_district'] = this.dialog.fields_dict['custom_district'].get_value();
	/**
	 * Using alias fieldnames because the doctype definition define "email_id" and "mobile_no" as readonly fields.
	 * Therefor, resulting in the fields being "hidden".
	 */
	const map_field_names = {
		"email_address": "email_id",
		"mobile_number": "mobile_no",
	};
	Object.entries(map_field_names).forEach(([fieldname, new_fieldname]) => {
		this.dialog.doc[new_fieldname] = this.dialog.doc[fieldname];
		delete this.dialog.doc[fieldname];
	});

	return frappe.ui.form.QuickEntryForm.prototype.insert.apply(this);
};
