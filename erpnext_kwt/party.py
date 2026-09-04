import frappe


def sync_primary_contact_middle_name(doc, method=None):
	"""Store the Quick Entry middle name on ERPNext's generated primary Contact."""
	middle_name = doc.get("middle_name")
	if not middle_name:
		return

	contact_field = {
		"Customer": "customer_primary_contact",
		"Supplier": "supplier_primary_contact",
	}.get(doc.doctype)
	contact_name = doc.get(contact_field) if contact_field else None
	if contact_name:
		frappe.set_value("Contact", contact_name, "middle_name", middle_name)
