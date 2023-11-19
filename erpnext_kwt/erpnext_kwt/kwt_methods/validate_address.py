import frappe

def validate_address(doc, method):
	if doc.country == 'Kuwait' and doc.city:
		doc.custom_district = doc.city
	