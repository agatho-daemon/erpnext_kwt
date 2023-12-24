import frappe
from frappe.utils import cint

def before_install():
    if not cint(frappe.db.get_single_value("System Settings", "setup_complete") or 0):
        message = "\n" + ("*" * 50) + "\n" + \
                "EPNext KWT can only be installed properly on a site with the setup wizard COMPLETED.\n" + \
                "Please complete the setup wizard, then run: bench --site [sitename] install-app eprnext_kwt\n" + \
                ("*" * 50) + "\n"
        print(message)
        exit()  # Exit the function cleanly

    else:
        frappe.db.set_value('Territory', 'Kuwait', 'is_group', 1)
        frappe.db.commit()