"""
Set custom fields value to use as filters to Address Listview
"""

import frappe

def set_custom_field(doc, method):
    if doc.links:
        doc.custom_filtered_customer_name = doc.links[0].link_name