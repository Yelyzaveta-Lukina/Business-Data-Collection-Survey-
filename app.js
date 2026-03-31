// 1) CONFIG
const BUSINESS_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Business_by_Industry/FeatureServer/0";
const EMPLOYEES_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Employees_by_Industry/FeatureServer/0";

// Field names MUST match ArcGIS
const BUSINESS_FIELDS = [
  { name: "professional_scientific_technical", label: "Professional, Scientific, and Technical Services" },
  { name: "finance_insurance", label: "Finance and Insurance" },
  { name: "health_care_social_assistance", label: "Health Care and Social Assistance" },
  { name: "retail_trade", label: "Retail Trade" },
  { name: "other_services", label: "Other services (except Public Administration)" },
  { name: "real_estate_rental_leasing", label: "Real Estate and Rental and Leasing" },
  { name: "accommodation_food_services", label: "Accommodation and Food Services" },
  { name: "construction", label: "Construction" },
  { name: "administrative_support_waste", label: "Administrative and Support and Waste Management and Remediation Services" },
  { name: "arts_entertainment_recreation", label: "Arts, Entertainment, and Recreation" },
  { name: "management_companies", label: "Management of Companies and Enterprises" },
  { name: "information", label: "Information" },
  { name: "manufacturing", label: "Manufacturing" },
  { name: "educational_services", label: "Educational Services" },
  { name: "wholesale_trade", label: "Wholesale Trade" },
  { name: "public_administration", label: "Public Administration" },
  { name: "transportation_storage", label: "Transportation and Storage" },
  { name: "agriculture_forestry_fishing", label: "Agriculture, Forestry, Fishing and Hunting" },
  { name: "mining", label: "Mining" },
  { name: "unknown_classification", label: "Unknown Classification" },
  { name: "aerospace_manufacturing", label: "Aerospace Product and Parts Manufacturing" },
  { name: "military", label: "Military" },
  { name: "utilities", label: "Utilities" }
];

const EMPLOYEE_FIELDS = [
  { name: "health_care_social_assistance", label: "Health Care and Social Assistance" },
  { name: "retail_trade", label: "Retail Trade" },
  { name: "professional_scientific_technical", label: "Professional, Scientific, and Technical Services" },
  { name: "public_administration", label: "Public Administration" },
  { name: "finance_insurance", label: "Finance and Insurance" },
  { name: "accommodation_food_services", label: "Accommodation and Food Services" },
  { name: "other_services", label: "Other Services (except Public Administration)" },
  { name: "information", label: "Information" },
  { name: "construction", label: "Construction" },
  { name: "real_estate_rental_leasing", label: "Real Estate and Rental and Leasing" },
  { name: "educational_services", label: "Educational Services" },
  { name: "arts_entertainment_recreation", label: "Arts, Entertainment, and Recreation" },
  { name: "manufacturing", label: "Manufacturing" },
  { name: "management_companies_enterprises", label: "Management of Companies and Enterprises" },
  { name: "admin_support_waste_management", label: "Administrative Support and Waste Management and Remediation Services" },
  { name: "transportation_storage", label: "Transportation and Storage" },
  { name: "wholesale_trade", label: "Wholesale Trade" },
  { name: "agriculture_forestry_fishing_hunting", label: "Agriculture, Forestry, Fishing and Hunting" },
  { name: "mining", label: "Mining" },
  { name: "aerospace_product_parts", label: "Aerospace Product and Parts Manufacturing" },
  { name: "utilities", label: "Utilities" },
  { name: "unknown_classification", label: "Unknown Classification" },
  { name: "military", label: "Military" }
];

// 2) DOM
const surveyDateEl = document.getElementById("surveyDate");
const btnBusiness = document.getElementById("btnBusiness");
const btnEmployees = document.getElementById("btnEmployees");
const sheetTitle = document.getElementById("sheetTitle");
const rowsEl = document.getElementById("rows");
const saveBtn = document.getElementById("saveSheet");
const sheetStatus = document.getElementById("sheetStatus");
const quarterSelect = document.getElementById("quarterSelect");
const clearBtn = document.getElementById("clearSheet");
const analyticsBtn = document.getElementById("analyticsBtn");
const yearSelect = document.getElementById("yearSelect");

// 3) STATE
let active = "business";

// Values user has typed (default 0)
let businessValues = {};
let employeeValues = {};

// Track which fields user touched
let businessTouched = {};
let employeeTouched = {};


// default date = today
surveyDateEl.valueAsDate = new Date();

// 4) HELPERS
function showStatus(msg, kind) {
  if (!msg) {
    sheetStatus.className = "status";
    sheetStatus.style.display = "none";
    sheetStatus.textContent = "";
    return;
  }
  sheetStatus.style.display = "block";
  sheetStatus.className = "status " + (kind === "ok" ? "status--ok" : "status--err");
  sheetStatus.textContent = msg;
}

function numOrZero(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.trunc(n);
}


function isValidCountString(s) {
  // Only "0" OR non-zero digits without leading zeros
  // Valid: "0", "1", "2", "10", "999"
  // Invalid: "", "-1", "1.5", "02", "005", "00"
  return /^(0|[1-9]\d*)$/.test(s);
}

function clearInputErrors() {
  document.querySelectorAll(".row__input--err").forEach(el => el.classList.remove("row__input--err"));
}

function markInputError(fieldName) {
  const el = document.querySelector(`.row__input[data-field="${CSS.escape(fieldName)}"]`);
  if (el) el.classList.add("row__input--err");
  return el;
}

function validateActiveSheet(fields, values, touched) {
  clearInputErrors();

  // validate only fields the user touched
  const bad = [];

  for (const f of fields) {
    if (!touched[f.name]) continue;

    const raw = (values[f.name] ?? "").trim();

    if (raw === "") {
      bad.push({ field: f.name, label: f.label, reason: "cannot be blank" });
      continue;
    }

    if (!isValidCountString(raw)) {
      bad.push({ field: f.name, label: f.label, reason: "must be a whole number (0 or more), no negatives/decimals/leading zeros" });
      continue;
    }
  }

  if (bad.length) {
    // mark inputs + focus first
    const first = bad[0];
    const firstEl = markInputError(first.field);
    bad.slice(1).forEach(e => markInputError(e.field));
    if (firstEl) firstEl.focus();

    // message
    const msg =
      `Please fix invalid values before saving.\n` +
      bad.map(e => `• ${e.label}: ${e.reason}`).join("\n");

    return { ok: false, message: msg };
  }

  return { ok: true, message: "" };
}



async function postForm(url, paramsObj) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(paramsObj)) body.set(k, v);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();
  if (data?.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

// Query current totals row (so untouched fields can stay the same)
async function loadTotals(layerUrl, objectId, fieldsList) {
  const outFields = ["OBJECTID", "survey_date", ...fieldsList.map(f => f.name)].join(",");

  const data = await postForm(`${layerUrl}/query`, {
    f: "json",
    where: `OBJECTID=${objectId}`,
    outFields,
    returnGeometry: "false"
  });

  const feat = data?.features?.[0];
  if (!feat?.attributes) throw new Error(`Totals row not found for OBJECTID=${objectId}`);
  return feat.attributes;
}

// Save via applyEdits updates
async function saveTotals(layerUrl, objectId, fieldsList, finalAttrs) {
  const updates = JSON.stringify([{ attributes: finalAttrs }]);

  const data = await postForm(`${layerUrl}/applyEdits`, {
    f: "json",
    updates
  });

  const r = data?.updateResults?.[0];
  if (!r?.success) throw new Error("Update failed: " + JSON.stringify(data, null, 2));
  return true;
}


async function getObjectIdByQuarterYear(layerUrl, quarter, surveyYear) {
  const data = await postForm(`${layerUrl}/query`, {
    f: "json",
    where: `quarter='${quarter}' AND survey_year=${Number(surveyYear)}`,
    outFields: "OBJECTID,quarter,survey_year",
    returnGeometry: "false"
  });

  const feat = data?.features?.[0];
  if (!feat?.attributes?.OBJECTID) {
    throw new Error(`No survey record exists yet for ${quarter} ${surveyYear}. Please choose a quarter/year that has been created in ArcGIS.`);
  }

  return feat.attributes.OBJECTID;
}

// 5) RENDER SHEET (shows 0s by default)
function renderSheet() {
  showStatus("", "ok");

  const isBusiness = active === "business";
  sheetTitle.textContent = isBusiness ? "Businesses by Industry" : "Employees by Industry";

  btnBusiness.classList.toggle("tab--active", isBusiness);
  btnEmployees.classList.toggle("tab--active", !isBusiness);

  const fields = isBusiness ? BUSINESS_FIELDS : EMPLOYEE_FIELDS;
  const values = isBusiness ? businessValues : employeeValues;
  const touched = isBusiness ? businessTouched : employeeTouched;

  rowsEl.innerHTML = "";

  fields.forEach(f => {
    const row = document.createElement("div");
    row.className = "row";

    const label = document.createElement("div");
    label.className = "row__label";
    label.textContent = f.label;

    const input = document.createElement("input");
    input.className = "row__input";
    input.type = "number";
    input.min = "0";
    input.step = "1";
    input.value = values[f.name] ?? "0";

    input.dataset.field = f.name;

    input.addEventListener("input", () => {
      values[f.name] = input.value.trim();   // store raw
      touched[f.name] = true;

      // Optional: remove red error styling as user edits
      input.classList.remove("row__input--err");
    });

    row.appendChild(label);
    row.appendChild(input);
    rowsEl.appendChild(row);
  });
}

// 6) INIT: set everything to 0 (no prefill)
function init() {
  BUSINESS_FIELDS.forEach(f => {
    businessValues[f.name] = "0";
    businessTouched[f.name] = false;
  });

  EMPLOYEE_FIELDS.forEach(f => {
    employeeValues[f.name] = "0";
    employeeTouched[f.name] = false;
  });

  renderSheet();
}

// Tabs
btnBusiness.addEventListener("click", () => { active = "business"; renderSheet(); });
btnEmployees.addEventListener("click", () => { active = "employees"; renderSheet(); });

saveBtn.addEventListener("click", async () => {
  // prevent double-click / parallel saves
  if (saveBtn.disabled) return;

  // UI: always go into "saving" state, but ALWAYS revert in finally
  const originalText = saveBtn.textContent;
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  try {
    const dateStr = surveyDateEl.value; // "YYYY-MM-DD"
    if (!dateStr) {
      showStatus("Please select a survey date.", "err");
      return;
    }

    const quarter = quarterSelect.value;
    if (!quarter) {
      showStatus("Please select a quarter before saving.", "err");
      return;
    }

    const surveyYear = yearSelect.value;
    if (!surveyYear) {
      showStatus("Please select a year before saving.", "err");
      return;
    }

    const isBusiness = active === "business";
    const fields = isBusiness ? BUSINESS_FIELDS : EMPLOYEE_FIELDS;
    const values = isBusiness ? businessValues : employeeValues;
    const touched = isBusiness ? businessTouched : employeeTouched;

    // ✅ validate here (even if invalid, finally will re-enable button)
    const v = validateActiveSheet(fields, values, touched);
    if (!v.ok) {
      showStatus(v.message, "err");
      return;
    }

    if (isBusiness) {
      const oid = await getObjectIdByQuarterYear(BUSINESS_LAYER_URL, quarter, surveyYear);
      const current = await loadTotals(BUSINESS_LAYER_URL, oid, BUSINESS_FIELDS);
      const attrs = { 
        OBJECTID: oid,
        quarter,
        survey_year: Number(surveyYear),
        survey_date: dateStr
      };    

      BUSINESS_FIELDS.forEach(f => {
        attrs[f.name] = businessTouched[f.name]
          ? parseInt((businessValues[f.name] ?? "0"), 10)
          : Number(current[f.name] ?? 0);
      });

      await saveTotals(BUSINESS_LAYER_URL, oid, BUSINESS_FIELDS, attrs);
      showStatus("Businesses saved successfully ✅", "ok");
      BUSINESS_FIELDS.forEach(f => (businessTouched[f.name] = false));
    } else {
        const oid = await getObjectIdByQuarterYear(EMPLOYEES_LAYER_URL, quarter, surveyYear);
        const current = await loadTotals(EMPLOYEES_LAYER_URL, oid, EMPLOYEE_FIELDS);
        const attrs = {
          OBJECTID: oid,
          quarter,
          survey_year: Number(surveyYear),
          survey_date: dateStr
        };

      EMPLOYEE_FIELDS.forEach(f => {
        attrs[f.name] = employeeTouched[f.name]
          ? parseInt((employeeValues[f.name] ?? "0"), 10)
          : Number(current[f.name] ?? 0);
      });

      await saveTotals(EMPLOYEES_LAYER_URL, oid, EMPLOYEE_FIELDS, attrs);
      showStatus("Employees saved successfully ✅", "ok");
      EMPLOYEE_FIELDS.forEach(f => (employeeTouched[f.name] = false));
    }
  } catch (e) {
    showStatus("Save failed ❌\n" + (e?.message || e), "err");
  } finally {
    // ✅ guarantee button never stays stuck
    saveBtn.disabled = false;
    saveBtn.textContent = originalText || "Save Changes";
  }
});

clearBtn.addEventListener("click", () => {

  const isBusiness = active === "business";
  const fields = isBusiness ? BUSINESS_FIELDS : EMPLOYEE_FIELDS;
  const values = isBusiness ? businessValues : employeeValues;
  const touched = isBusiness ? businessTouched : employeeTouched;

  fields.forEach(f => {
    values[f.name] = "0";
    touched[f.name] = false;
  });

  renderSheet();
  showStatus("Values cleared.", "ok");

});

analyticsBtn.addEventListener("click", () => {
  window.open("analytics.html", "_blank");
});


init();