frappe.ui.form.on('Address', {
    country: function(frm) {
        // Hide unnecessary fields for KWT
        // 'city' field is used to store the District in the background.
        if (frm.doc.country == "Kuwait") {
            // city is hidden but used to store the District
            frm.set_df_property("custom_district", "hidden", 0);
            frm.set_df_property("city", "hidden", 1);
            frm.set_df_property("county", "hidden", 1);
            // Change labels of 'state' and 'pincode' fields
            frm.set_df_property("state", "label", "Governorate");
            frm.set_df_property("pincode", "label", "PACI");
        } else {
            frm.set_df_property("city", "hidden", 0);
            frm.set_df_property("county", "hidden", 0);
            // Reset labels of 'state' and 'pincode' fields to default
            frm.set_df_property("state", "label", "State/Province");
            frm.set_df_property("pincode", "label", "Postal Code");
            // Hide the custom_district field
            frm.set_df_property("custom_district", "hidden", 1);
            // frm.reload_doc();
        }
    },

    custom_district: function(frm) {
        // Set the City (hidden field) from the District
        let district_value = frm.doc.custom_district;
        frm.set_value("city", district_value);

        // Fetch the Territory/Governorate from the District
        frappe.db.get_value("KWT District", frm.doc.custom_district, "governorate")
        .then (r => {
            if (r.message) {
                frm.set_value("state", r.message.governorate);
            }
        });
    },


})