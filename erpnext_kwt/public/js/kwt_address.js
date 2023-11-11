frappe.ui.form.on('Address', {
    refresh: function(frm) {
        frm.set_df_property("county", "hidden", 1);
        frm.set_df_property("pincode", "hidden", 1);
        frm.set_df_property("state", "hidden", 1);
        // frm.set_df_property("address_line1", "hidden", 1);
        frm.set_df_property("address_line2", "hidden", 1);
        frm.set_value("country", "Kuwait");

        // frm.fields_dict['city'].set_label('District');
        // frm..fields_dict['city'].fieldtype = "Link";
        // if (frm.doc.country == "Kuwait") {
        //     frm.set_value("city", "Kuwait City");
        //     // console.log("Right call");
        // }
    },

    custom_district: function(frm) {
        let value1 = frm.doc.custom_district;
        frm.set_value("city", value1);
    }


})