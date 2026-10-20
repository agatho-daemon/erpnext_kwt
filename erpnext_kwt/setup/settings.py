"""Native regional defaults, applied at installation rather than every migration."""

import frappe


def apply_kuwait_settings():
	"""Apply the Kuwait setup policy explicitly; never commit the caller's transaction."""
	settings = frappe.get_single("System Settings")
	set_changed_values(settings, {"currency_precision": "3", "float_precision": "3"})

	currency = frappe.get_doc("Currency", "KWD")
	set_changed_values(
		currency,
		{"fraction": "Fils", "fraction_units": 1000, "smallest_currency_fraction_value": 0.005},
	)

	stock = frappe.get_single("Stock Settings")
	set_changed_values(stock, {"clean_description_html": 0})


def set_changed_values(doc, values):
	if all(doc.get(field) == value for field, value in values.items()):
		return
	doc.update(values)
	doc.save(ignore_permissions=True)
