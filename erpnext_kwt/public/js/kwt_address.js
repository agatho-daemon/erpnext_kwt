// Description: Custom script for Address doctype in Kuwait
// Author: WSQG
// Version: 0.0.2
// Last Update: 2023-12-17

// For a Kuwait address, we need to:
// 1. Use a custom_district field linked to the KWT District doctype
// 2. Hide the City and County fields, and set the City field from the District field
// 3. Change the labels of State and Pincode fields to Territory/Governorate and PACI
// 4. Fetch the Territory/Governorate field value from the District doctype


frappe.ui.form.on('Address', {
    setup: function(frm) {

        // KWT address settings
        frm.set_kwt_address = function() {
            // Hidden fields
            frm.set_df_property("county", "hidden", 1);
            // Fields that need be renamed
            frm.set_df_property("city", "label", "District")
            frm.set_df_property("state", "label", "Governorate");
            frm.set_df_property("pincode", "label", "PACI");
        }

        // Reset address settings to default
        frm.reset_address = function() {
            // Restore Hidden fields
            frm.set_df_property("county", "hidden", 0);
            // Restore default labels
            frm.set_df_property("city", "label", "City/Town");
            frm.set_df_property("state", "label", "State/Province");
            frm.set_df_property("pincode", "label", "Postal Code");
        }
    },

    country: function(frm) {
        // Change fields display according to Country field.
        if (frm.doc.country == "Kuwait") {
            frm.set_kwt_address();
        } else {
            frm.reset_address();
        }
    },

    city: function(frm) {
        // Fetch the Governorate from District Name
        frappe.db.get_value("FUA City", {'city_name': frm.doc.city}, "state")
        .then (record => {
            if (record.message) {
                frm.set_value("state", record.message.state);
            }
        });
    },

    refresh: function(frm) {
        if (frm.doc.country == "Kuwait") {
            frm.set_kwt_address();
        } else {
            frm.reset_address();
        }
    },

})