// Description: Custom script for Address doctype
// Author: WSQG
// Version: 0.0.1

// For a Kuwait address, we need to:
// 1. Use a custom_district field linked to the KWT District doctype
// 2. Hide the City and County fields, and set the City field from the District field
// 3. Change the labels of State and Pincode fields to Territory/Governorate and PACI
// 4. Fetch the Territory/Governorate field value from the District doctype

// KWT address settings
function set_kwt_address(frm) {
    frm.set_df_property("custom_district", "hidden", 0);
    frm.set_df_property("city", "hidden", 1);
    frm.set_df_property("county", "hidden", 1);
    // Change labels of 'state' and 'pincode' fields
    frm.set_df_property("state", "label", "Governorate");
    frm.set_df_property("pincode", "label", "PACI");
}

// Reset address settings to default
function reset_address(frm) {
    frm.set_df_property("custom_district", "hidden", 1);
    frm.set_df_property("city", "hidden", 0);
    frm.set_df_property("county", "hidden", 0);
    // Reset labels of 'state' and 'pincode' fields to default
    frm.set_df_property("state", "label", "State/Province");
    frm.set_df_property("pincode", "label", "Postal Code");

}

frappe.ui.form.on('Address', {
    country: function(frm) {
        if (frm.doc.country == "Kuwait") {
            set_kwt_address(frm);
        } else {
            reset_address(frm);
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