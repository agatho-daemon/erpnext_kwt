frappe.ui.form.on('Address', {
    refresh: function(frm) {
        // Hide unnecessary fields
        // 'city' field is used to store the District in the background.
        frm.set_df_property("city", "hidden", 1);
        frm.set_df_property("county", "hidden", 1);
        frm.set_df_property("pincode", "hidden", 1);
        
        // Change label of 'State' to 'Territory/Governorate'
        frm.set_df_property("state", "label", "Governorate");
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