"""Verify installation policy, repeatability and native settings behavior."""

import unittest
from unittest.mock import MagicMock, patch

import frappe

from erpnext_kwt.setup.settings import apply_kuwait_settings, set_changed_values


class TestRegionalSettings(unittest.TestCase):
	def test_installation_applies_settings_after_seed_data(self):
		from erpnext_kwt import hooks

		self.assertEqual(hooks.after_install, "erpnext_kwt.setup.install.after_install")
		self.assertEqual(hooks.after_migrate, "erpnext_kwt.setup.install.sync_kuwait_seed_data")
		with (
			patch("erpnext_kwt.setup.install.sync_kuwait_seed_data") as seed,
			patch("erpnext_kwt.setup.settings.apply_kuwait_settings") as settings,
		):
			calls = MagicMock()
			calls.attach_mock(seed, "seed")
			calls.attach_mock(settings, "settings")
			from erpnext_kwt.setup.install import after_install

			after_install()
			self.assertEqual([call[0] for call in calls.mock_calls], ["seed", "settings"])

	def test_matching_settings_are_not_saved(self):
		doc = MagicMock()
		doc.get.side_effect = {"currency_precision": "3", "float_precision": "3"}.get
		set_changed_values(doc, {"currency_precision": "3", "float_precision": "3"})
		doc.update.assert_not_called()
		doc.save.assert_not_called()

	def test_changed_policy_saves_only_requested_values(self):
		doc = MagicMock()
		doc.get.return_value = "2"
		values = {"currency_precision": "3", "float_precision": "3"}
		set_changed_values(doc, values)
		doc.update.assert_called_once_with(values)
		doc.save.assert_called_once_with(ignore_permissions=True)

	def test_native_settings_with_rollback(self):
		if not getattr(frappe.local, "site", None):
			self.skipTest("Requires an initialized development site")
		frappe.db.savepoint("kwt_settings_test")
		try:
			system = frappe.get_single("System Settings")
			method = system.rounding_method
			# Exercise installation against differing native values.
			system.float_precision = "2"
			system.currency_precision = "2"
			system.save(ignore_permissions=True)
			stock = frappe.get_single("Stock Settings")
			stock.clean_description_html = 1
			stock.save(ignore_permissions=True)
			apply_kuwait_settings()
			self.assertEqual(frappe.db.get_single_value("System Settings", "float_precision"), "3")
			self.assertEqual(frappe.db.get_single_value("System Settings", "currency_precision"), "3")
			self.assertEqual(frappe.get_single("System Settings").rounding_method, method)
			self.assertEqual(frappe.get_single("Stock Settings").clean_description_html, 0)
			currency = frappe.get_doc("Currency", "KWD")
			self.assertEqual((currency.fraction, currency.fraction_units), ("Fils", 1000))
			self.assertEqual(currency.smallest_currency_fraction_value, 0.005)
			with patch("frappe.model.document.Document.save") as save:
				apply_kuwait_settings()
				save.assert_not_called()
		finally:
			frappe.db.rollback(save_point="kwt_settings_test")
			frappe.clear_cache()
