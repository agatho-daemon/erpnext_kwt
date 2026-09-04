import json
from pathlib import Path

import frappe
from frappe import _
from frappe.model.rename_doc import rename_doc as rename_document
from frappe.utils.nestedset import get_root_of

KUWAIT = "Kuwait"
SEED_FILES = {
	"territories": "territory.json",
	"states": "fua_state.json",
	"cities": "fua_city.json",
}


def load_seed_records(seed_name):
	filename = SEED_FILES[seed_name]
	path = Path(frappe.get_app_path("erpnext_kwt", "fixtures", filename))
	return json.loads(path.read_text(encoding="utf-8"))


def sync_kuwait_seed_data():
	"""Create missing Kuwait reference data without overwriting administrator changes."""
	kuwait_territory = ensure_kuwait_territory()
	seed_territories(kuwait_territory)
	state_names = seed_states()
	seed_cities(state_names)


def ensure_kuwait_territory():
	name = frappe.db.get_value("Territory", {"territory_name": KUWAIT}, "name")
	if not name:
		root = get_root_of("Territory")
		if not root:
			frappe.throw(_("Complete the ERPNext setup wizard before installing ERPNext KWT."))
		doc = frappe.get_doc(
			{
				"doctype": "Territory",
				"territory_name": KUWAIT,
				"parent_territory": root,
				"is_group": 1,
			}
		).insert(ignore_permissions=True)
		return doc.name

	doc = frappe.get_doc("Territory", name)
	if not doc.is_group:
		doc.is_group = 1
		doc.save(ignore_permissions=True)
	return doc.name


def seed_territories(kuwait_territory):
	for record in load_seed_records("territories"):
		name = frappe.db.get_value("Territory", {"territory_name": record["territory_name"]}, "name")
		if name:
			parent = frappe.db.get_value("Territory", name, "parent_territory")
			if parent != kuwait_territory:
				frappe.throw(_("Territory {0} already exists outside Kuwait.").format(frappe.bold(name)))
			continue

		frappe.get_doc(
			{
				"doctype": "Territory",
				"territory_name": record["territory_name"],
				"parent_territory": kuwait_territory,
				"is_group": record.get("is_group", 0),
			}
		).insert(ignore_permissions=True)


def seed_states():
	state_names = {}
	for record in load_seed_records("states"):
		name = frappe.db.get_value(
			"FUA State",
			{"state_name": record["state_name"], "country": record["country"]},
			"name",
		)
		if not name:
			doc = frappe.get_doc(
				{
					"doctype": "FUA State",
					"state_name": record["state_name"],
					"state_abbreviation": record.get("state_abbreviation"),
					"country": record["country"],
				}
			).insert(ignore_permissions=True)
			name = doc.name
		state_names[record["name"]] = name
	return state_names


def seed_cities(state_names):
	for record in load_seed_records("cities"):
		state = state_names[record["state"]]
		canonical_name = record["city_name"]
		previous_names = list(dict.fromkeys(record.get("previous_names") or []))
		existing_cities = frappe.get_all(
			"FUA City",
			filters={
				"city_name": ["in", [canonical_name, *previous_names]],
				"state": state,
				"country": record["country"],
			},
			fields=["name", "city_name", "county"],
		)
		expected_county = record.get("county") or ""
		existing_cities = [city for city in existing_cities if (city.county or "") == expected_county]
		canonical_matches = [city for city in existing_cities if city.city_name == canonical_name]
		previous_matches = [city for city in existing_cities if city.city_name in previous_names]

		if canonical_matches:
			canonical_city = canonical_matches[0]
			for old_city in previous_matches:
				rename_document(
					"FUA City",
					old_city.name,
					canonical_city.name,
					merge=True,
					ignore_permissions=True,
				)
			if previous_matches:
				frappe.set_value(
					"FUA City",
					canonical_city.name,
					{
						"city_name": canonical_name,
						"city_abbreviation": record.get("city_abbreviation"),
					},
				)
			continue

		if len(previous_matches) > 1:
			frappe.throw(
				_("Multiple previous spellings match seeded city {0}: {1}").format(
					frappe.bold(canonical_name),
					", ".join(frappe.bold(city.name) for city in previous_matches),
				)
			)

		if previous_matches:
			old_city = previous_matches[0]
			new_name = record.get("name") or canonical_name
			rename_document("FUA City", old_city.name, new_name, ignore_permissions=True)
			frappe.set_value(
				"FUA City",
				new_name,
				{
					"city_name": canonical_name,
					"city_abbreviation": record.get("city_abbreviation"),
				},
			)
			continue

		frappe.get_doc(
			{
				"doctype": "FUA City",
				"city_name": record["city_name"],
				"city_abbreviation": record.get("city_abbreviation"),
				"state": state,
				"territory": record.get("territory"),
				"country": record["country"],
				"county": record.get("county"),
			}
		).insert(ignore_permissions=True)
