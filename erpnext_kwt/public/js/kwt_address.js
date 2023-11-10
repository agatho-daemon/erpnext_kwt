frappe.ui.form.on('Address', {
    refresh(frm) {
        frm.set_df_property("county", "hidden", 1);
        frm.set_df_property("pincode", "hidden", 1);
        frm.set_df_property("state", "hidden", 1);
        frm.set_df_property("address_line1", "hidden", 1);
        frm.set_df_property("address_line2", "hidden", 1);
        // frm.fields_dict['city'].set_label('District');
        // frm..fields_dict['city'].fieldtype = "Link";
        // if (frm.doc.country == "Kuwait") {
        //     frm.set_value("city", "Kuwait City");
        //     // console.log("Right call");
        // }
    }
})