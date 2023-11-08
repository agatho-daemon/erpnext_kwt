frappe.ui.form.on('Address', {
    refresh(frm) {
        frm.fields_dict['city'].set_label('District');
        // if (frm.doc.country == "Kuwait") {
        //     frm.set_value("city", "Kuwait City");
        //     // console.log("Right call");
        // }
    }
})