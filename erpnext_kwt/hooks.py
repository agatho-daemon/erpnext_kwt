from . import __version__ as app_version

app_name = "erpnext_kwt"
app_title = "ERPNext KWT"
app_publisher = "Wasaq Group Co"
app_description = "Kuwait Country Customizations."
app_color = "#e74c3c"
app_email = "info@wsqgroup.com"
app_license = "CC0 1.0 Universal"
source_link = "https://github.com/agatho-daemon/erpnext_kwt"

# Includes in <head>
# ------------------

# Required apps
required_apps = ["erpnext"]


# fixtures
fixtures = [
    "KWT Governorate",
    "KWT District",
    {"dt": "Custom Field", "filters": [
        [
            "name",
            "in",
            {
                "Address-custom_kuwait_address_details",
                "Address-custom_block",
                "Address-custom_building",
                "Address-custom_floor",
                "custom_column_break_khv3w",
                "Address-custom_street",
                "Address-custom_parcel",
                "Address-custom_flat",
                "custom_column_break_hqsba",
                "Address-custom_lane",
                "Address-custom_building_name",
                "Address-custom_paci",
            }
        ]
    ]},
]


# include js, css files in header of desk.html
# app_include_css = "/assets/erpnext_kwt/css/erpnext_kwt.css"
# app_include_js = "/assets/erpnext_kwt/js/erpnext_kwt.js"

# include js, css files in header of web template
# web_include_css = "/assets/erpnext_kwt/css/erpnext_kwt.css"
# web_include_js = "/assets/erpnext_kwt/js/erpnext_kwt.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "erpnext_kwt/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
doctype_js = {
    "Address": "public/js/kwt_address.js"
}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "erpnext_kwt.utils.jinja_methods",
#	"filters": "erpnext_kwt.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "erpnext_kwt.install.before_install"
# after_install = "erpnext_kwt.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "erpnext_kwt.uninstall.before_uninstall"
# after_uninstall = "erpnext_kwt.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "erpnext_kwt.utils.before_app_install"
# after_app_install = "erpnext_kwt.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "erpnext_kwt.utils.before_app_uninstall"
# after_app_uninstall = "erpnext_kwt.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "erpnext_kwt.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"erpnext_kwt.tasks.all"
#	],
#	"daily": [
#		"erpnext_kwt.tasks.daily"
#	],
#	"hourly": [
#		"erpnext_kwt.tasks.hourly"
#	],
#	"weekly": [
#		"erpnext_kwt.tasks.weekly"
#	],
#	"monthly": [
#		"erpnext_kwt.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "erpnext_kwt.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "erpnext_kwt.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "erpnext_kwt.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["erpnext_kwt.utils.before_request"]
# after_request = ["erpnext_kwt.utils.after_request"]

# Job Events
# ----------
# before_job = ["erpnext_kwt.utils.before_job"]
# after_job = ["erpnext_kwt.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"erpnext_kwt.auth.validate"
# ]
