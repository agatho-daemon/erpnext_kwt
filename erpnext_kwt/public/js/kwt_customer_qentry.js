frappe.provide('frappe.ui.form');

// Backup the original render_dialog function
const original_render_dialog = frappe.ui.form.ContactQEntry.prototype.render_dialog;

// Extend the render_dialog function
frappe.ui.form.ContactQEntry.prototype.render_dialog = function() {
    // Call the original render_dialog function
    original_render_dialog.apply(this);

    // Update fields based on country
    this.update_field_labels(frappe.sys_defaults.country);
};


// Function to update field labels based on the country
frappe.ui.form.ContactQEntry.prototype.update_field_labels = function(countryValue) {
    // let country = this.dialog.get_value('country');
    // console.log('Country changed to:', country);

    // Check if the country is Kuwait and update labels
    if (countryValue === 'Kuwait') {
        this.dialog.set_df_property('city', 'label', __('District'));
        this.dialog.set_df_property('state', 'label', __('Governorate'));
        this.dialog.set_df_property('pincode', 'label', __('PACI'));
    } else {
        // Reset to default labels if the country is not Kuwait
        this.dialog.set_df_property('city', 'label', __('City'));
        this.dialog.set_df_property('state', 'label', __('State'));
        this.dialog.set_df_property('pincode', 'label', __('ZIP Code'));
    }
};

// Extend the country_changed function to use the new label update logic
frappe.ui.form.ContactQEntry.prototype.country_changed = function() {
    let countryValue = this.dialog.get_value('country');
    this.update_field_labels(countryValue);
};

