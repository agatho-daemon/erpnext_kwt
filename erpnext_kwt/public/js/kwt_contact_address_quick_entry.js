frappe.provide('frappe.ui.form');

const originalGetVariantFields = frappe.ui.form.ContactAddressQuickEntryForm.prototype.get_variant_fields;
const originalRenderDialog = frappe.ui.form.ContactAddressQuickEntryForm.prototype.render_dialog;


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
            label: __("Address Line 1"),
            fieldname: "address_line1",
            fieldtype: "Data",
        },
        {
            label: __("Address Line 2"),
            fieldname: "address_line2",
            fieldtype: "Data"
        },
        {
            label: __("PACI"),
            fieldname: "pincode",
            fieldtype: "Data"
        },
        {
            fieldtype: "Column Break"
        },
        {
            label: __("City/Town"),
            fieldname: "city",
            fieldtype: "Link",
            options: "FUA City",
        },
        {
            label: __("Governorate"),
            fieldname: "state",
            fieldtype: "Link",
            options: "FUA State"
        },
        {
            label: __("Country"),
            fieldname: "country",
            fieldtype: "Link",
            options: "Country",
            default: "Kuwait",
        },
        {
            label: __("Customer POS Id"),
            fieldname: "customer_pos_id",
            fieldtype: "Data",
            hidden: 1
        }];
    
        return variant_fields;    
};


frappe.ui.form.ContactAddressQuickEntryForm.prototype.render_dialog = function() {
    // Call original render_dialog
    originalRenderDialog.apply(this);

    // Attach onchange handler to country field
    if (this.dialog.fields_dict.country) {
        this.dialog.fields_dict.country.df.onchange = () => {
            this.country_changed();
        };
    }

    // Attach onchange handler to city field
    if (this.dialog.fields_dict.city) {
        this.dialog.fields_dict.city.df.onchange = () => {
            this.city_changed();
        };
    }
};

frappe.ui.form.ContactAddressQuickEntryForm.prototype.city_changed = function() {
    let city_value = this.dialog.get_value('city');
    if (city_value) {
        // Fetch Governorate based on city value
        frappe.db.get_value('FUA City', {'city_name': city_value}, 'state')
            .then(r => {
                if (r.message) {
                    // Set Governorate value
                    this.dialog.set_value('state', r.message.state);
                }
            });
    }
};

frappe.ui.form.ContactAddressQuickEntryForm.prototype.country_changed = function() {
    let country = this.dialog.get_value('country');

    // If country is NOT Kuwait, restore default labels
    if (country !== 'Kuwait') {
        this.dialog.set_df_property('city', 'label', 'City/Town');
        this.dialog.set_df_property('state', 'label', 'State/Province');
        this.dialog.set_df_property('pincode', 'label', 'Postal Code');
    }
};
