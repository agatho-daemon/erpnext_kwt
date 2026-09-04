import frappe
from frappe.custom.doctype.custom_field.custom_field import rename_fieldname

FIELD_RENAMES = {
	"Employee-custom_driver_license_issue_date": "custom_driver_license_issue_date",
	"Employee-custom_moi_and_paci": "custom_moi_and_paci_section",
}


def execute():
	for custom_field, fieldname in FIELD_RENAMES.items():
		current_fieldname = frappe.db.get_value("Custom Field", custom_field, "fieldname")
		if current_fieldname and current_fieldname != fieldname:
			rename_fieldname(custom_field, fieldname)

	if frappe.db.exists("Property Setter", "Employee-main-field_order"):
		frappe.delete_doc(
			"Property Setter",
			"Employee-main-field_order",
			ignore_permissions=True,
			force=True,
		)
