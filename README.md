# ERPNext KWT

Kuwait regional customizations for Frappe and ERPNext v16.

## Requirements

- Python 3.14
- Frappe 16
- ERPNext 16
- Frappe HR 16
- Frappe Utilities App (`futilitap`)

Install the required apps before ERPNext KWT. The recommended order is Frappe,
ERPNext, Frappe HR, futilitap, and ERPNext KWT.

## Included customizations

- Kuwait-aware Customer and Supplier Quick Entry with Arabic Name and structured Block,
  Street, Lane, Building, Floor, and Unit fields. These values are stored in the
  native Address Line 1 and Address Line 2 fields.
- Kuwait-aware Address form labels and structured address editor.
- Arabic-name fields for Customer, Supplier, Employee, and Shareholder.
- Kuwait MOI, Civil ID, driver-license, and residence information on Employee.
- Idempotent Kuwait governorate, district, and territory seed data. Existing
  administrator-maintained records are not overwritten during migration.

Employee does not have a native Quick Entry form in ERPNext v16, so its Kuwait
fields remain on the full Employee form. Enabling Employee Quick Entry would be
a separate workflow change because Employee does not natively create a linked
Address from Quick Entry.

## Installation settings

Installation applies these native settings across the site:

- System Settings: Currency Precision **3** and Float Precision **3**.
- KWD Currency: fraction **Fils**, **1,000** fraction units per dinar, and smallest
  currency fraction **0.005** for native rounding to the nearest five fils.
- Stock Settings: **Clean Description HTML** disabled to preserve bilingual
  description direction and alignment. Native HTML sanitization remains active.

The existing rounding method, other currencies, account configuration and HVAC
pricing policies are unchanged. Currency Precision and Float Precision are global
defaults; explicit field precision still takes precedence. This setup does not
recalculate or save existing transactions.

Migrations synchronize geographic reference data but do not reapply these settings.
Administrator changes made after installation are preserved. To adopt the defaults
on an existing site, review the site-wide effects and run explicitly:

```sh
bench --site SITE execute erpnext_kwt.setup.settings.apply_kuwait_settings
```

This command deliberately reapplies the listed policy. Repeating it with matching
values does not save those settings again.

## License

CC0 1.0 Universal
