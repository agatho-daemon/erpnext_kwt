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

## License

CC0 1.0 Universal
