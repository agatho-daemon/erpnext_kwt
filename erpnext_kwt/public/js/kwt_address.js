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
                frm.set_df_property('county', 'hidden', 1);
                frm.set_df_property('state', 'label', __('Governorate'));
                frm.set_df_property('pincode', 'label', __('PACI'));
            } else {
                // Reset to default labels
                frm.set_df_property('city', 'label', __('City/Town'));
                frm.set_df_property('county', 'hidden', 0);
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

        // Trigger modal on focus of address_line1 or address_line2
        ['address_line1', 'address_line2'].forEach(field => {
            frm.fields_dict[field].$input.on('focus', function() {
                // Only show modal if it is not already open
                if(!cur_frm.address_modal_shown) {
                    cur_frm.address_modal_shown = true;
                    show_address_modal(frm);
                }
            });
        });
    },
    onload_post_render: function(frm) {
        if (!frm.doc.address_title && frm.doc.links && frm.doc.links.length > 0) {
            frm.doc.links.forEach(function(row) {
                let linkName = row.link_name;
                let linkDoctype = row.link_doctype;

                if (linkDoctype === 'Customer' || linkDoctype === 'Supplier') {
                    let fieldname = (linkDoctype === 'Customer') ? 'customer_name' : 'supplier_name';

                    frappe.db.get_value(linkDoctype, linkName, fieldname)
                        .then(response => {
                            if (response.message) {
                                let addressTitle = response.message[fieldname];
                                frm.set_value('address_title', addressTitle);
                            }
                        });
                }
            });
        }
    },
});

// Function to show the address modal
function show_address_modal(frm) {
    const fields = [
        {'fieldname': 'block', 'fieldtype': 'Data', 'label': 'Block', 'reqd': 1},
        {'fieldname': 'street', 'fieldtype': 'Data', 'label': 'Street [Format: 000 (Description)]'},
        {'fieldname': 'lane', 'fieldtype': 'Data', 'label': 'Lane [Format: 00 (Description)]'},
        {'fieldname': 'building', 'fieldtype': 'Data', 'label': 'Building [Format: 000 (Description)]'},
        {'fieldname': 'floor', 'fieldtype': 'Data', 'label': 'Floor'},
        {'fieldname': 'unit', 'fieldtype': 'Data', 'label': 'Unit'},
    ];

    const d = new frappe.ui.Dialog({
        title: __('Address Details'),
        fields: fields,
        primary_action_label: __('Submit'),
        primary_action(values) {
            // Format and construct address lines with zero padding
            const block = values.block.padStart(2, '0');
            const street = format_field_with_description(values.street, 3);
            const lane = format_field_with_description(values.lane, 2);
            const building = format_field_with_description(values.building, 3);
            const floor = format_floor(values.floor);
            const unit = values.unit || '';

            // Construct address lines from the provided values
            frm.set_value('address_line1', `Block: ${block} • Street: ${street}${lane ? ' • Lane: ' + lane : ''}`);
            frm.set_value('address_line2', `${building ? 'Bldg: ' + building : ''}${floor ? ' • Floor: ' + floor : ''}${unit ? ' • Unit: ' + unit : ''}`);
            d.hide()
        }
    });

    d.show();
    d.onhide = () => {
        cur_frm.address_modal_shown = false;
    };
}

// Function to format fields that might include a numeric prefix and a descriptive suffix, or just a name
function format_field_with_description(input, numLength) {
    if (!input) return '';

    // Try to split the input into numeric and descriptive components
    let matches = input.match(/^(\d*)\s*(.*)/);
    let number = matches[1];
    let description = matches[2].trim();

    // If there's a number, pad it and format with description if available
    if (number) {
        number = number.padStart(numLength, '0');
        if (description) {
            // If description exists, ensure it's properly enclosed in parentheses
            if (!description.startsWith('(') || !description.endsWith(')')) {
                description = `(${description})`;
            }
            return `${number} ${description}`;
        }
        return number; // Return just the number if no description
    } else {
        // If there's no number, return the plain description (which is the full input here)
        return description; // Return without parentheses as it's purely descriptive
    }
}

// format floor number/description
function format_floor(input) {
    if (!input) return '';
    if (/^\d+$/.test(input)) {
        return input.padStart(2, '0');
    }
    return input;
}