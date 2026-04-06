// 1) CONFIG
const BUSINESS_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Business_by_Industry/FeatureServer/0";
const EMPLOYEES_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Employees_by_Industry/FeatureServer/0";
const ORIGIN_LAYER_URL = 
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Employees_Origin_Type/FeatureServer/0";
const OFFICE_MARKET_LAYER_URL = 
"https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Office_Market_Stats_By_Class/FeatureServer/0";


const MONTHS = [
  "",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];



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
const originAreaTypeEl = document.getElementById("originAreaType");
const originReportYearEl = document.getElementById("originReportYear");
const originReportMonthEl = document.getElementById("originReportMonth");
const originFileEl = document.getElementById("originFile");
const originUploadBtn = document.getElementById("originUploadBtn");
const originUploadStatus = document.getElementById("originUploadStatus");
const officeAreaTypeEl = document.getElementById("officeAreaType");
const officeClassAFileEl = document.getElementById("officeClassAFile");
const officeClassBFileEl = document.getElementById("officeClassBFile");
const officeUploadBtn = document.getElementById("officeUploadBtn");
const officeUploadStatus = document.getElementById("officeUploadStatus");

// 3) STATE
let active = "business";
let originUploadPreviewRecords = [];

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

function showOriginUploadStatus(msg, kind) {
  if (!msg) {
    originUploadStatus.className = "status";
    originUploadStatus.style.display = "none";
    originUploadStatus.textContent = "";
    return;
  }

  originUploadStatus.style.display = "block";
  originUploadStatus.className = "status " + (kind === "ok" ? "status--ok" : "status--err");
  originUploadStatus.textContent = msg;
}


function showOfficeUploadStatus(msg, kind) {
  if (!msg) {
    officeUploadStatus.className = "status";
    officeUploadStatus.style.display = "none";
    officeUploadStatus.textContent = "";
    return;
  }

  officeUploadStatus.style.display = "block";
  officeUploadStatus.className = "status " + (kind === "ok" ? "status--ok" : "status--err");
  officeUploadStatus.textContent = msg;
}


function parseTotalSfValue(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const cleaned = raw
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .trim()
    .toUpperCase();

  if (cleaned.endsWith("M")) {
    const n = Number(cleaned.slice(0, -1));
    return Number.isFinite(n) ? n * 1000000 : null;
  }

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}


function extractYearQuarter(periodValue) {
  const s = String(periodValue || "").toUpperCase();

  const match = s.match(/(\d{4})\s*Q([1-4])/);
  if (!match) return null;

  return {
    year: Number(match[1]),
    quarter: "Q" + match[2]
  };
}

function buildOfficeMarketRecords(rows, headers, metadata, buildingClass) {
  const periodHeader = findHeader(headers, ["Period"]);
  const vacancyHeader = findHeader(headers, [
    "Vacant Percent % Total",
    "Vacancy Rate",
    "Vacancy %",
    "Vacant % Total"
  ]);
  const rentHeader = findHeader(headers, [
    "Office Gross Rent Overall",
    "Market Asking Rent/SF",
    "Asking Rent",
    "Rent/SF"
  ]);
  const totalSfHeader = findHeader(headers, [
    "Inventory SF",
    "Total SF",
    "Total Square Feet",
    "SF"
  ]);

  if (!periodHeader || !vacancyHeader || !rentHeader || !totalSfHeader) {
    throw new Error("Missing required columns in file.");
  }

  const records = [];

  rows.forEach(row => {
    const periodInfo = extractYearQuarter(row[periodHeader]);
    if (!periodInfo) return;

    const vacancyRate = parseNumberValue(row[vacancyHeader]);
    const rent = parseNumberValue(row[rentHeader]);
    const totalSf = parseTotalSfValue(row[totalSfHeader]);

    if (vacancyRate === null || rent === null || totalSf === null) return;

    records.push({
      area_type: metadata.areaType,
      building_class: buildingClass,
      report_year: periodInfo.year,
      report_quarter: periodInfo.quarter,
      vacancy_rate: vacancyRate,
      market_asking_rent_sf: rent,
      total_sf: totalSf,
      source_file_name: metadata.fileName,
      uploaded_at: new Date().toISOString()
    });
  });

  return records;
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

async function getExistingOfficeMarketObjectIdsByClass(areaType, buildingClass) {
  const where =
    `area_type='${areaType}' AND building_class='${buildingClass}'`;

  const data = await postForm(`${OFFICE_MARKET_LAYER_URL}/query`, {
    f: "json",
    where,
    outFields: "OBJECTID",
    returnGeometry: "false"
  });

  return (data.features || [])
    .map(f => f?.attributes?.OBJECTID)
    .filter(Boolean);
}

async function deleteOfficeMarketRecords(objectIds) {
  if (!objectIds.length) return;

  const deletes = objectIds.join(",");

  const data = await postForm(`${OFFICE_MARKET_LAYER_URL}/applyEdits`, {
    f: "json",
    deletes
  });

  if (data?.error) {
    throw new Error(data.error.message || "Failed deleting existing office market records.");
  }
}


async function addOfficeMarketRecords(records) {
  const adds = JSON.stringify(
    records.map(record => ({ attributes: record }))
  );

  console.log("Office market records being sent:", records.slice(0, 5));
  console.log("Total office market records:", records.length);

  const data = await postForm(`${OFFICE_MARKET_LAYER_URL}/applyEdits`, {
    f: "json",
    adds
  });

  console.log("Office market applyEdits response:", data);

  const results = data?.addResults || [];

  if (!results.length) {
    throw new Error("ArcGIS returned no addResults.");
  }

  const failed = results.find(r => !r.success);

  if (failed) {
    const errorMessage =
      failed?.error?.description ||
      failed?.error?.message ||
      JSON.stringify(failed?.error) ||
      "Unknown ArcGIS add error.";

    throw new Error(`Failed adding office market records. ${errorMessage}`);
  }

  return results;
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

function normalizeHeaderName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findHeader(headers, candidates) {
  const normalizedHeaders = headers.map(h => normalizeHeaderName(h));

  for (const candidate of candidates) {
    const idx = normalizedHeaders.indexOf(normalizeHeaderName(candidate));
    if (idx !== -1) return headers[idx];
  }

  return null;
}

async function readExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("The Excel file does not contain any worksheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false
  });

  const headers = rows.length ? Object.keys(rows[0]) : [];

  return {
    sheetName: firstSheetName,
    headers,
    rows
  };
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseCsvText(csvText) {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(line => line.trim() !== "");

  if (!lines.length) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]);

  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });

  return { headers, rows };
}

async function readCsvFile(file) {
  const text = await file.text();
  return parseCsvText(text);
}


function cleanText(value) {
  return String(value ?? "").trim();
}

function parseNumberValue(value) {
  const s = String(value ?? "")
    .trim()
    .replace(/,/g, "")
    .replace(/%/g, "");

  if (s === "") return null;

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function normalizeZipcode(value) {
  const raw = cleanText(value);
  if (!raw) return "";

  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return raw;

  return digitsOnly.padStart(5, "0").slice(0, 5);
}

function buildOriginRecords(rows, headers, metadata) {
  const zipcodeHeader = findHeader(headers, ["Zipcode", "ZIP Code", "Zip Code", "ZIP"]);
  const cityHeader = findHeader(headers, ["City"]);
  const stateHeader = findHeader(headers, ["State"]);
  const latHeader = findHeader(headers, ["lat", "latitude"]);
  const lngHeader = findHeader(headers, ["lng", "lon", "long", "longitude"]);
  const employeesHeader = findHeader(headers, ["Employees"]);
  const pctEmployeesHeader = findHeader(headers, [
    "% of Employees",
    "Percent of Employees",
    "Employees %",
    "% Employees"
  ]);
  const yoyHeader = findHeader(headers, [
    "YoY Change in Employees",
    "YoY Change",
    "YOY Change in Employees",
    "YOY Change"
  ]);
  const notesHeader = findHeader(headers, ["Data Notes", "Notes"]);

  const missingRequired = [];
  if (!zipcodeHeader) missingRequired.push("Zipcode");
  if (!employeesHeader) missingRequired.push("Employees");
  if (!latHeader) missingRequired.push("lat");
  if (!lngHeader) missingRequired.push("lng");

  if (missingRequired.length) {
    throw new Error(
      "Missing required columns: " + missingRequired.join(", ")
    );
  }

  const normalizedRecords = [];
  let skippedRows = 0;

  rows.forEach((row, index) => {
    const zipcode = normalizeZipcode(row[zipcodeHeader]);
    const employees = parseNumberValue(row[employeesHeader]);
    const lat = parseNumberValue(row[latHeader]);
    const lng = parseNumberValue(row[lngHeader]);

    const isCompletelyEmpty =
      !zipcode &&
      employees === null &&
      lat === null &&
      lng === null;

    if (isCompletelyEmpty) {
      skippedRows++;
      return;
    }

    if (!zipcode || employees === null || lat === null || lng === null) {
  console.log("Skipped row:", {
    reason: {
      missingZipcode: !zipcode,
      missingEmployees: employees === null,
      missingLat: lat === null,
      missingLng: lng === null
    },
    rawRow: row
  });

  skippedRows++;
  return;
}

    normalizedRecords.push({
      area_type: metadata.areaType,
      report_year: Number(metadata.reportYear),
      report_month: metadata.reportMonth,
      zipcode,
      city: cityHeader ? cleanText(row[cityHeader]) : "",
      state: stateHeader ? cleanText(row[stateHeader]) : "",
      lat,
      lng,
      employees,
      pct_employees: pctEmployeesHeader ? (parseNumberValue(row[pctEmployeesHeader]) ?? 0) : 0,
      yoy_change_employees: yoyHeader ? (parseNumberValue(row[yoyHeader]) ?? 0) : 0,
      data_notes: notesHeader ? cleanText(row[notesHeader]) : "",
      source_file_name: metadata.fileName,
      source_row_number: index + 2
    });
  });

  return {
    records: normalizedRecords,
    skippedRows,
    detectedHeaders: {
      zipcodeHeader,
      cityHeader,
      stateHeader,
      latHeader,
      lngHeader,
      employeesHeader,
      pctEmployeesHeader,
      yoyHeader,
      notesHeader
    }
  };
}


function getPeriodLabel(reportMonth, reportYear) {
  return `${MONTHS[Number(reportMonth)]} ${reportYear}`;
}

function buildArcGISFeatures(records) {
  return records.map(r => ({
   attributes: {
  area_type: r.area_type,
  report_year: r.report_year,
  report_month: r.report_month,
  zipcode: r.zipcode,
  city: r.city,
  state: r.state,
  lat: r.lat,
  lng: r.lng,
  employees: r.employees,
  pct_employees: r.pct_employees,
  yoy_change_employees: r.yoy_change_employees,
  data_notes: r.data_notes,
  source_file_name: r.source_file_name,
  source_row_number: r.source_row_number
},
    geometry: {
      x: r.lng,
      y: r.lat,
      spatialReference: { wkid: 4326 }
    }
  }));
}

async function deleteExistingOriginRecords(areaType, reportYear, reportMonth) {
  const where = `
    area_type = '${areaType}'
    AND report_year = ${reportYear}
    AND report_month = ${reportMonth}
  `;

  const queryUrl = `${ORIGIN_LAYER_URL}/query`;
  const deleteUrl = `${ORIGIN_LAYER_URL}/deleteFeatures`;

  const queryRes = await fetch(queryUrl, {
    method: "POST",
    body: new URLSearchParams({
      where,
      returnIdsOnly: "true",
      f: "json"
    })
  }).then(r => r.json());

  const ids = queryRes.objectIds;

  if (!ids || !ids.length) return false;

  await fetch(deleteUrl, {
    method: "POST",
    body: new URLSearchParams({
      objectIds: ids.join(","),
      f: "json"
    })
  });

  return true;
}


async function checkExistingRecords(areaType, reportYear, reportMonth) {
  const where = `
    area_type = '${areaType}'
    AND report_year = ${reportYear}
    AND report_month = ${reportMonth}
  `;

  const res = await fetch(`${ORIGIN_LAYER_URL}/query`, {
    method: "POST",
    body: new URLSearchParams({
      where,
      returnCountOnly: "true",
      f: "json"
    })
  }).then(r => r.json());

  return res.count > 0;
}


async function addOriginFeatures(features) {
  const url = `${ORIGIN_LAYER_URL}/addFeatures`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      features: JSON.stringify(features),
      f: "json"
    })
  });

  const data = await res.json();

  console.log("addFeatures response:", data);

  if (data.error) {
    throw new Error(data.error.message || "ArcGIS addFeatures failed.");
  }

  const addResults = data.addResults || [];
  const failedAdds = addResults.filter(r => !r.success);

  if (!addResults.length) {
    throw new Error("ArcGIS returned no addResults.");
  }

  if (failedAdds.length) {
    const firstError = failedAdds[0]?.error?.description ||
      failedAdds[0]?.error?.message ||
      JSON.stringify(failedAdds[0]?.error) ||
      "Unknown addFeatures error.";

    throw new Error(`ArcGIS rejected ${failedAdds.length} feature(s). ${firstError}`);
  }

  return data;
}


originUploadBtn.addEventListener("click", async () => {
  const areaType = originAreaTypeEl.value;
  const reportYear = originReportYearEl.value;
  const reportMonth = Number(originReportMonthEl.value);  
  const file = originFileEl.files?.[0];

  const periodLabel = getPeriodLabel(reportMonth, reportYear);

  showOriginUploadStatus("", "ok");

  if (!areaType || !reportYear || !reportMonth || !file) {
    showOriginUploadStatus("Please select area type, year, month and file.", "err");
    return;
  }

  const fileName = file.name.toLowerCase();

  originUploadBtn.disabled = true;
  const originalBtnText = originUploadBtn.textContent;
  originUploadBtn.textContent = "Reading file…";

  try {
    let headers = [];
    let rows = [];
    let sourceType = "";

    if (fileName.endsWith(".csv")) {
      const result = await readCsvFile(file);
      headers = result.headers;
      rows = result.rows;
      sourceType = "CSV";
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const result = await readExcelFile(file);
      headers = result.headers;
      rows = result.rows;
      sourceType = "Excel";
    } else {
      showOriginUploadStatus(
        "Unsupported file type. Please upload CSV or Excel.",
        "err"
      );
      return;
    }

    if (!headers.length) {
      showOriginUploadStatus("File is empty or missing headers.", "err");
      return;
    }

    if (!rows.length) {
      showOriginUploadStatus("File has headers but no data rows.", "err");
      return;
    }

    const metadata = {
      areaType,
      reportYear,
      reportMonth,
      fileName: file.name
    };

    const { records, skippedRows, detectedHeaders } = buildOriginRecords(rows, headers, metadata);
    
    originUploadBtn.textContent = "Uploading…";

if (!records.length) {
  showOriginUploadStatus(
    "No valid data rows were found after normalization. Please check the file contents.",
    "err"
  );
  return;
}

originUploadPreviewRecords = records;



const hasExisting = await checkExistingRecords(areaType, reportYear, reportMonth);

if (hasExisting) {
  showOriginUploadStatus(
    `Existing records for ${areaType} — ${periodLabel} were found and will be replaced.`,
    "ok"
  );
}

// STEP 1: delete old records
await deleteExistingOriginRecords(areaType, reportYear, reportMonth);

// STEP 2: build features
const features = buildArcGISFeatures(records);

console.log("Features being sent to ArcGIS (first 3):", features.slice(0, 3));
console.log("Total features being sent:", features.length);

// STEP 3: upload new records
const result = await addOriginFeatures(features);
const successCount = result.addResults.filter(r => r.success).length;

if (!successCount) {
  throw new Error("ArcGIS did not add any records.");
}

const totalEmployees = records.reduce((sum, r) => sum + (r.employees || 0), 0);
const topRecord = [...records].sort((a, b) => b.employees - a.employees)[0];

console.log("Origin upload metadata:", metadata);
console.log("Detected headers:", detectedHeaders);
console.log("Normalized records (first 10):", records.slice(0, 10));
console.log("Total normalized records:", records.length);
console.log("Skipped rows:", skippedRows);

showOriginUploadStatus(
  `Upload successful.\n` +
  `Added records: ${successCount}\n` +
  `Skipped rows: ${skippedRows}\n` +
  `Total Employees: ${totalEmployees.toLocaleString()}\n` +
  `Top ZIP: ${topRecord.zipcode} (${topRecord.employees.toLocaleString()} employees)\n` +
  `Area: ${areaType}\n` +
  `Year: ${reportYear}\n` +
  `Period: ${periodLabel}`,
  "ok"
);
  } catch (err) {
    console.error(err);
    showOriginUploadStatus(
      "Could not process file.\n" + (err?.message || err),
      "err"
    );
  } finally {
    originUploadBtn.disabled = false;
    originUploadBtn.textContent = originalBtnText;
  }
});

analyticsBtn.addEventListener("click", () => {
  window.open("analytics.html", "_blank");
});

officeUploadBtn.addEventListener("click", async () => {
  if (officeUploadBtn.disabled) return;

  const originalText = officeUploadBtn.textContent;
  officeUploadBtn.disabled = true;
  officeUploadBtn.textContent = "Processing…";

  try {
    showOfficeUploadStatus("", "ok");

    const areaType = officeAreaTypeEl.value;
    const classAFile = officeClassAFileEl.files[0];
    const classBFile = officeClassBFileEl.files[0];

    if (!areaType) {
      showOfficeUploadStatus("Please select an area type.", "err");
      return;
    }

    if (!classAFile && !classBFile) {
      showOfficeUploadStatus("Please upload at least one file: Class A or Class B.", "err");
      return;
    }

    let totalInserted = 0;
    const updatedClasses = [];

    if (classAFile) {
      const data = classAFile.name.toLowerCase().endsWith(".csv")
        ? await readCsvFile(classAFile)
        : await readExcelFile(classAFile);

      const records = buildOfficeMarketRecords(
        data.rows,
        data.headers,
        { areaType, fileName: classAFile.name },
        "A"
      );

      if (!records.length) {
        throw new Error(`No valid quarterly records were found in ${classAFile.name}.`);
      }

      const existingIds = await getExistingOfficeMarketObjectIdsByClass(areaType, "A");
      if (existingIds.length) {
        await deleteOfficeMarketRecords(existingIds);
      }

      await addOfficeMarketRecords(records);
      totalInserted += records.length;
      updatedClasses.push("Class A");
    }

    if (classBFile) {
      const data = classBFile.name.toLowerCase().endsWith(".csv")
        ? await readCsvFile(classBFile)
        : await readExcelFile(classBFile);

      const records = buildOfficeMarketRecords(
        data.rows,
        data.headers,
        { areaType, fileName: classBFile.name },
        "B"
      );

      if (!records.length) {
        throw new Error(`No valid quarterly records were found in ${classBFile.name}.`);
      }

      const existingIds = await getExistingOfficeMarketObjectIdsByClass(areaType, "B");
      if (existingIds.length) {
        await deleteOfficeMarketRecords(existingIds);
      }

      await addOfficeMarketRecords(records);
      totalInserted += records.length;
      updatedClasses.push("Class B");
    }

    showOfficeUploadStatus(
      `Upload successful.\nUpdated: ${updatedClasses.join(", ")}\nInserted records: ${totalInserted}`,
      "ok"
    );

    officeClassAFileEl.value = "";
    officeClassBFileEl.value = "";
  } catch (e) {
    console.error(e);
    showOfficeUploadStatus(
      "Office market upload failed.\n" + (e?.message || e),
      "err"
    );
  } finally {
    officeUploadBtn.disabled = false;
    officeUploadBtn.textContent = originalText || "Upload & Process";
  }
});


init();