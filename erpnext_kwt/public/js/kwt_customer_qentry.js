frappe.provide('frappe.ui.form');

// frappe.ui.form.ContactQEntry.prototype.country_changed = function() {
//     let country = this.dialog.get_value('country');

//     // Check if the country is Kuwait
//     if (country === 'Kuwait') {
//         this.dialog.set_df_property('city', 'label', __('District'));
//         this.dialog.set_df_property('state', 'label', __('Governorate'));
//         this.dialog.set_df_property('pincode', 'label', __('PACI'));
//     } else {
//         // Reset to default labels if the country is not Kuwait
//         // Assuming you have default labels stored or you can set them explicitly
//         this.dialog.set_df_property('city', 'label', __('City'));
//         this.dialog.set_df_property('state', 'label', __('State'));
//         this.dialog.set_df_property('pincode', 'label', __('ZIP Code'));
//     }
// };