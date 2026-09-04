import {
  apply_kuwait_address_labels,
  compose_kuwait_address,
  get_structured_address_fields,
  is_kuwait,
  parse_kuwait_address,
} from "./kwt_address_utils.js";

function update_address_labels(frm) {
  apply_kuwait_address_labels(frm, frm.doc.country);
  frm.set_df_property("county", "hidden", is_kuwait(frm.doc.country) ? 1 : 0);
}

function bind_kuwait_address_dialog(frm) {
  ["address_line1", "address_line2"].forEach((fieldname) => {
    const input = frm.fields_dict[fieldname]?.$input;
    if (!input) {
      return;
    }

    input.off("focus.erpnext_kwt").on("focus.erpnext_kwt", () => {
      if (is_kuwait(frm.doc.country) && !frm.__kwt_address_dialog_open) {
        show_kuwait_address_dialog(frm);
      }
    });
  });
}

frappe.ui.form.on("Address", {
  refresh(frm) {
    update_address_labels(frm);
    bind_kuwait_address_dialog(frm);
  },

  country(frm) {
    update_address_labels(frm);
  },
});

function show_kuwait_address_dialog(frm) {
  frm.__kwt_address_dialog_open = true;
  const current_values = parse_kuwait_address(
    frm.doc.address_line1,
    frm.doc.address_line2
  );
  const dialog = new frappe.ui.Dialog({
    title: __("Kuwait Address Details"),
    fields: get_structured_address_fields(),
    primary_action_label: __("Apply"),
    primary_action(values) {
      const address = compose_kuwait_address(values);
      if (!address.address_line1) {
        frappe.msgprint(
          __("Enter a block, street, or lane before applying the address.")
        );
        return;
      }

      frm.set_value("address_line1", address.address_line1);
      frm.set_value("address_line2", address.address_line2);
      dialog.hide();
    },
  });

  dialog.onhide = () => {
    frm.__kwt_address_dialog_open = false;
  };
  dialog.show();
  dialog.set_values(current_values);
}
