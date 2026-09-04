import json
import unittest
from pathlib import Path
from unittest.mock import patch

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"
SEED_DATA = Path(__file__).resolve().parents[1] / "seed_data"


def load_fixture(filename):
	path = (
		SEED_DATA / filename
		if filename in {"fua_city.json", "fua_state.json", "territory.json"}
		else FIXTURES / filename
	)
	return json.loads(path.read_text(encoding="utf-8"))


class TestV16Metadata(unittest.TestCase):
	def test_kuwait_seed_references_are_complete(self):
		states = load_fixture("fua_state.json")
		cities = load_fixture("fua_city.json")
		territories = load_fixture("territory.json")

		state_names = {state["name"] for state in states}
		territory_names = {territory["name"] for territory in territories}
		self.assertEqual({state["country"] for state in states}, {"Kuwait"})
		self.assertEqual({city["country"] for city in cities}, {"Kuwait"})
		self.assertFalse({city["state"] for city in cities} - state_names)
		self.assertFalse({city["territory"] for city in cities if city.get("territory")} - territory_names)

	def test_seed_records_have_stable_unique_labels(self):
		for filename, label_field in (
			("fua_state.json", "state_name"),
			("fua_city.json", "city_name"),
			("territory.json", "territory_name"),
		):
			records = load_fixture(filename)
			labels = [record[label_field] for record in records]
			self.assertEqual(len(labels), len(set(labels)), filename)

	def test_city_previous_names_do_not_collide_with_current_seed_names(self):
		cities = load_fixture("fua_city.json")
		current_names = {city["city_name"] for city in cities}
		previous_names = [name for city in cities for name in city.get("previous_names", [])]

		self.assertEqual(len(previous_names), len(set(previous_names)))
		self.assertFalse(current_names.intersection(previous_names))

	def test_employee_layout_is_not_frozen(self):
		setters = load_fixture("property_setter.json")
		self.assertNotIn("Employee-main-field_order", {setter["name"] for setter in setters})

	def test_custom_field_names_are_v16_names(self):
		fields = load_fixture("custom_field.json")
		fieldnames = {field["fieldname"] for field in fields}
		self.assertIn("custom_driver_license_issue_date", fieldnames)
		self.assertIn("custom_moi_and_paci_section", fieldnames)
		self.assertNotIn("custom_driver_lincense_validity", fieldnames)
		self.assertNotIn("custom_moi__paci", fieldnames)

	def test_customer_paci_is_identified_as_the_unit_number(self):
		fields = load_fixture("custom_field.json")
		customer_paci = next(field for field in fields if field["name"] == "Customer-custom_paci")
		self.assertEqual(customer_paci["fieldname"], "custom_paci")
		self.assertEqual(customer_paci["label"], "Unit PACI Number")

	def test_party_middle_name_save_hooks_are_registered(self):
		from erpnext_kwt import hooks

		handler = "erpnext_kwt.party.sync_primary_contact_middle_name"
		self.assertEqual(hooks.doc_events["Customer"]["on_update"], handler)
		self.assertEqual(hooks.doc_events["Supplier"]["on_update"], handler)

	def test_territory_root_is_bootstrapped_on_a_fresh_site(self):
		from erpnext_kwt.setup.install import ALL_TERRITORIES, ensure_territory_root

		root_doc = unittest.mock.MagicMock()
		database = unittest.mock.MagicMock()
		database.get_value.return_value = ALL_TERRITORIES
		with (
			patch("erpnext_kwt.setup.install.get_root_of", return_value=None),
			patch("erpnext_kwt.setup.install.frappe.get_doc", return_value=root_doc) as get_doc,
			patch("erpnext_kwt.setup.install.frappe.db", database),
		):
			root = ensure_territory_root()

		self.assertEqual(root, ALL_TERRITORIES)
		get_doc.assert_called_once_with(
			{
				"doctype": "Territory",
				"name": ALL_TERRITORIES,
				"territory_name": ALL_TERRITORIES,
				"parent_territory": "",
				"is_group": 1,
			}
		)
		self.assertTrue(root_doc.flags.ignore_mandatory)
		root_doc.insert.assert_called_once_with(ignore_permissions=True, ignore_if_duplicate=True)

	def test_customer_middle_name_is_stored_on_primary_contact(self):
		from erpnext_kwt.party import sync_primary_contact_middle_name

		class CustomerDocument(dict):
			doctype = "Customer"

		doc = CustomerDocument(
			middle_name="Mohammed",
			customer_primary_contact="Ahmed Ali-Contact",
		)
		with patch("erpnext_kwt.party.frappe.set_value") as set_value:
			sync_primary_contact_middle_name(doc)

		set_value.assert_called_once_with("Contact", "Ahmed Ali-Contact", "middle_name", "Mohammed")

	def test_city_seed_treats_null_and_empty_counties_as_equal(self):
		from frappe import _dict

		from erpnext_kwt.setup.install import seed_cities

		record = {
			"name": "Ardiya Government",
			"city_name": "Ardiya Government",
			"state": "Farwaniya",
			"country": "Kuwait",
			"county": None,
		}
		with (
			patch("erpnext_kwt.setup.install.load_seed_records", return_value=[record]),
			patch(
				"erpnext_kwt.setup.install.frappe.get_all",
				return_value=[_dict(name="Ardiya Government", city_name="Ardiya Government", county=None)],
			),
			patch("erpnext_kwt.setup.install.frappe.get_doc") as get_doc,
		):
			seed_cities({"Farwaniya": "Farwaniya"})

		get_doc.assert_not_called()

	def test_city_seed_renames_a_known_previous_spelling(self):
		from frappe import _dict

		from erpnext_kwt.setup.install import seed_cities

		record = {
			"name": "Qurtuba",
			"city_name": "Qurtuba",
			"city_abbreviation": "QRT",
			"state": "AlAsima",
			"country": "Kuwait",
			"county": None,
			"previous_names": ["Qortuba"],
		}
		with (
			patch("erpnext_kwt.setup.install.load_seed_records", return_value=[record]),
			patch(
				"erpnext_kwt.setup.install.frappe.get_all",
				return_value=[_dict(name="Qortuba", city_name="Qortuba", county=None)],
			),
			patch("erpnext_kwt.setup.install.rename_document") as rename_doc,
			patch("erpnext_kwt.setup.install.frappe.set_value") as set_value,
			patch("erpnext_kwt.setup.install.frappe.get_doc") as get_doc,
		):
			seed_cities({"AlAsima": "AlAsima"})

		rename_doc.assert_called_once_with("FUA City", "Qortuba", "Qurtuba", ignore_permissions=True)
		set_value.assert_called_once_with(
			"FUA City",
			"Qurtuba",
			{"city_name": "Qurtuba", "city_abbreviation": "QRT"},
		)
		get_doc.assert_not_called()

	def test_city_seed_merges_an_old_spelling_into_an_existing_canonical_city(self):
		from frappe import _dict

		from erpnext_kwt.setup.install import seed_cities

		record = {
			"name": "Qurtuba",
			"city_name": "Qurtuba",
			"state": "AlAsima",
			"country": "Kuwait",
			"county": None,
			"previous_names": ["Qortuba"],
		}
		with (
			patch("erpnext_kwt.setup.install.load_seed_records", return_value=[record]),
			patch(
				"erpnext_kwt.setup.install.frappe.get_all",
				return_value=[
					_dict(name="Qurtuba", city_name="Qurtuba", county=None),
					_dict(name="Qortuba", city_name="Qortuba", county=None),
				],
			),
			patch("erpnext_kwt.setup.install.rename_document") as rename_doc,
			patch("erpnext_kwt.setup.install.frappe.set_value") as set_value,
		):
			seed_cities({"AlAsima": "AlAsima"})

		rename_doc.assert_called_once_with(
			"FUA City",
			"Qortuba",
			"Qurtuba",
			merge=True,
			ignore_permissions=True,
		)
		set_value.assert_called_once_with(
			"FUA City",
			"Qurtuba",
			{"city_name": "Qurtuba", "city_abbreviation": None},
		)
