export const KUWAIT = "Kuwait";

const STRUCTURED_ADDRESS_FIELDS = [
  "block",
  "street",
  "lane",
  "building",
  "floor",
  "unit",
];

export function get_default_country() {
  return (
    frappe.defaults.get_user_default("country") ||
    frappe.defaults.get_user_default("Country") ||
    frappe.sys_defaults.country ||
    KUWAIT
  );
}

export function is_kuwait(country) {
  return country === KUWAIT;
}

export function format_numbered_value(value, length) {
  const normalized = (value || "").trim();
  if (!normalized) {
    return "";
  }

  const match = normalized.match(/^(\d*)\s*(.*)/);
  if (!match[1]) {
    return match[2].trim();
  }

  const number = match[1].padStart(length, "0");
  let description = match[2].trim();
  if (!description) {
    return number;
  }
  if (!description.startsWith("(") || !description.endsWith(")")) {
    description = `(${description})`;
  }
  return `${number} ${description}`;
}

export function format_floor(value) {
  const normalized = (value || "").trim();
  return /^\d+$/.test(normalized) ? normalized.padStart(2, "0") : normalized;
}

export function compose_kuwait_address(values) {
  const line1 = [
    values.block ? `Block: ${values.block.trim().padStart(2, "0")}` : "",
    values.street ? `Street: ${format_numbered_value(values.street, 3)}` : "",
    values.lane ? `Lane: ${format_numbered_value(values.lane, 2)}` : "",
  ].filter(Boolean);
  const line2 = [
    values.building ? `Bldg: ${format_numbered_value(values.building, 3)}` : "",
    values.floor ? `Floor: ${format_floor(values.floor)}` : "",
    values.unit ? `Unit: ${values.unit.trim()}` : "",
  ].filter(Boolean);
  const has_address_details = Boolean(
    line1.length ||
      line2.length ||
      values.pincode ||
      values.city ||
      values.state
  );

  return {
    address_line1: line1.join(" • ") || (has_address_details ? "␀" : ""),
    address_line2: line2.join(" • "),
  };
}

export function parse_kuwait_address(address_line1 = "", address_line2 = "") {
  const result = {};
  const labels = {
    Block: "block",
    Street: "street",
    Lane: "lane",
    Bldg: "building",
    Floor: "floor",
    Unit: "unit",
  };

  [address_line1, address_line2].forEach((line) => {
    line.split(" • ").forEach((part) => {
      const separator = part.indexOf(":");
      if (separator < 0) {
        return;
      }
      const fieldname = labels[part.slice(0, separator).trim()];
      if (fieldname) {
        result[fieldname] = part.slice(separator + 1).trim();
      }
    });
  });
  return result;
}

export function get_structured_address_fields() {
  return [
    { fieldname: "block", fieldtype: "Data", label: __("Block") },
    {
      fieldname: "street",
      fieldtype: "Data",
      label: __("Street [Format: 000 (Description)]"),
    },
    {
      fieldname: "lane",
      fieldtype: "Data",
      label: __("Lane [Format: 00 (Description)]"),
    },
    {
      fieldname: "building",
      fieldtype: "Data",
      label: __("Building [Format: 000 (Description)]"),
    },
    { fieldname: "floor", fieldtype: "Data", label: __("Floor") },
    { fieldname: "unit", fieldtype: "Data", label: __("Unit") },
  ];
}

export function get_quick_entry_address_fields() {
  const kuwait_only = "eval:doc.country_address=='Kuwait'";
  const outside_kuwait = "eval:doc.country_address!='Kuwait'";
  const structured_fields = get_structured_address_fields().map((field) => ({
    ...field,
    depends_on: kuwait_only,
  }));

  return [
    {
      fieldtype: "Section Break",
      label: __("Primary Contact Details"),
      collapsible: 0,
    },
    {
      label: __("First Name"),
      fieldname: "map_to_first_name",
      fieldtype: "Data",
      depends_on:
        "eval:doc.customer_type=='Company' || doc.supplier_type=='Company'",
    },
    {
      label: __("Middle Name"),
      fieldname: "map_to_middle_name",
      fieldtype: "Data",
      depends_on:
        "eval:doc.customer_type=='Company' || doc.supplier_type=='Company'",
    },
    {
      label: __("Last Name"),
      fieldname: "map_to_last_name",
      fieldtype: "Data",
      depends_on:
        "eval:doc.customer_type=='Company' || doc.supplier_type=='Company'",
    },
    { fieldtype: "Column Break" },
    {
      label: __("Email Id"),
      fieldname: "email_address",
      fieldtype: "Data",
      options: "Email",
    },
    {
      label: __("Mobile Number"),
      fieldname: "mobile_number",
      fieldtype: "Data",
    },
    {
      fieldtype: "Section Break",
      label: __("Primary Address Details"),
      collapsible: 0,
    },
    ...structured_fields.slice(0, 3),
    {
      label: __("Address Line 1"),
      fieldname: "address_line1",
      fieldtype: "Data",
      depends_on: outside_kuwait,
      mandatory_depends_on:
        "eval:doc.country_address!='Kuwait' && (doc.city || doc.country_address)",
    },
    {
      label: __("Address Line 2"),
      fieldname: "address_line2",
      fieldtype: "Data",
      depends_on: outside_kuwait,
    },
    {
      label: __("Parcel PACI Number"),
      fieldname: "pincode",
      fieldtype: "Data",
    },
    {
      label: __("Governorate"),
      fieldname: "state",
      fieldtype: "Link",
      options: "FUA State",
      read_only: 1,
    },
    { fieldtype: "Column Break" },
    ...structured_fields.slice(3),
    {
      label: __("District"),
      fieldname: "city",
      fieldtype: "Link",
      options: "FUA City",
    },
    {
      label: __("Country"),
      fieldname: "country_address",
      fieldtype: "Link",
      options: "Country",
      default: get_default_country(),
      mandatory_depends_on:
        "eval:doc.city || doc.address_line1 || doc.block || doc.street",
    },
  ];
}

export function apply_kuwait_address_labels(field_group, country) {
  const labels = is_kuwait(country)
    ? {
        city: __("District"),
        state: __("Governorate"),
        pincode: __("Parcel PACI Number"),
      }
    : {
        city: __("City"),
        state: __("State/Province"),
        pincode: __("ZIP Code"),
      };

  Object.entries(labels).forEach(([fieldname, label]) => {
    field_group.set_df_property(fieldname, "label", label);
  });
}
