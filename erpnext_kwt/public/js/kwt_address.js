// Description: Custom script for Address doctype in Kuwait
// Author: WSQG
// Version: 0.0.2
// Last Update: 2023-12-17

// For a Kuwait address, we need to:
// 1. Change labels for City, State and Pincode fields
// 4. Fetch the Governorate field value from the District doctype


frappe.ui.form.on('Address', {
    refresh: function(frm) {
        // Function to update labels based on the country
        function update_labels(country) {
            if (country === 'Kuwait') {
                frm.set_df_property('city', 'label', __('District'));
                frm.set_df_property('state', 'label', __('Governorate'));
                frm.set_df_property('pincode', 'label', __('PACI'));
            } else {
                // Reset to default labels
                frm.set_df_property('city', 'label', __('City/Town'));
                frm.set_df_property('state', 'label', __('State/Province'));
                frm.set_df_property('pincode', 'label', __('Postal Code'));
            }
        }

        // Attach onchange handler to country field
        frm.fields_dict['country'].df.onchange = () => {
            let country = frm.doc.country;
            update_labels(country);
        };

        // Update labels on form load
        update_labels(frm.doc.country);
    }
});
