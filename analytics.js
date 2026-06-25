const BUSINESS_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Business_by_Industry/FeatureServer/0";

const EMPLOYEES_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Employees_by_Industry/FeatureServer/0";

const EMPLOYEES_ORIGIN_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Employees_Origin_Type/FeatureServer/0";

const OFFICE_LAYER_URL = 
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Office_Market_Stats_By_Class/FeatureServer/0";

const REV_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Residents_Employees_Visitors_Stats/FeatureServer/0";

const BUSINESS_FIELDS = [
  { name: "professional_scientific_technical", label: "Professional, Scientific, and Technical Services" },
  { name: "finance_insurance", label: "Finance and Insurance" },
  { name: "health_care_social_assistance", label: "Health Care and Social Assistance" },
  { name: "retail_trade", label: "Retail Trade" },
  { name: "other_services", label: "Other Services (except Public Administration)" },
  { name: "real_estate_rental_leasing", label: "Real Estate and Rental and Leasing" },
  { name: "accommodation_food_services", label: "Accommodation and Food Services" },
  { name: "construction", label: "Construction" },
  { name: "administrative_support_waste", label: "Administrative Support and Waste Management and Remediation Services" },
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

/* -----------------------------
   DOM
----------------------------- */
const quarterEl = document.getElementById("analyticsQuarter");
const analyticsYearEl = document.getElementById("analyticsYear");
const businessCanvas = document.getElementById("businessChart");
const employeesCanvas = document.getElementById("employeesChart");
const totalBusinessesEl = document.getElementById("totalBusinesses");
const totalEmployeesEl = document.getElementById("totalEmployees");
const topIndustryEl = document.getElementById("topIndustry");

const analyticsMenuItems = document.querySelectorAll(".analyticsMenuItem");
const analyticsContentSections = document.querySelectorAll(".analyticsContentSection");

const originAnalyticsYearEl = document.getElementById("originAnalyticsYear");
const originAnalyticsQuarterEl = document.getElementById("originAnalyticsQuarter");
const originAnalyticsAreaTypeEl = document.getElementById("originAnalyticsAreaType");
const originMapMessageEl = document.getElementById("originMapMessage");
const originTotalEmployeesEl = document.getElementById("originTotalEmployees");
const originTotalAreasEl = document.getElementById("originTotalAreas");
const originTopZipEl = document.getElementById("originTopZip");
const originTopCityEl = document.getElementById("originTopCity");
const originTopTableBodyEl = document.getElementById("originTopTableBody");

const revAnalyticsYearEl = document.getElementById("revAnalyticsYear");
const revAnalyticsMonthEl = document.getElementById("revAnalyticsMonth");
const revAnalyticsAreaEl = document.getElementById("revAnalyticsArea");
const revAnalyticsMessageEl = document.getElementById("revAnalyticsMessage");

const revResidentsValueEl = document.getElementById("revResidentsValue");
const revEmployeesValueEl = document.getElementById("revEmployeesValue");
const revVisitorsValueEl = document.getElementById("revVisitorsValue");

const revResidentsChangeEl = document.getElementById("revResidentsChange");
const revEmployeesChangeEl = document.getElementById("revEmployeesChange");
const revVisitorsChangeEl = document.getElementById("revVisitorsChange");

/* -----------------------------
   State
----------------------------- */
let businessChart = null;
let employeesChart = null;
let originMap = null;
let originMarkersLayer = null;

let revComparisonChart = null;
let revTrendChart = null;

/* -----------------------------
   Helpers
----------------------------- */
async function postForm(url, paramsObj) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(paramsObj)) body.set(k, v);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  const data = await res.json();
  if (data?.error) {
    throw new Error(data.error.message || JSON.stringify(data.error));
  }
  return data;
}

function destroyChart(chart) {
  if (chart) chart.destroy();
}

function buildChartData(attributes, fields) {
  const labels = [];
  const values = [];

  fields.forEach(f => {
    labels.push(f.label);
    values.push(Number(attributes[f.name] ?? 0));
  });

  return { labels, values };
}

function sumValues(attributes, fields) {
  return fields.reduce((sum, f) => sum + Number(attributes[f.name] ?? 0), 0);
}

async function getQuarterAttributes(layerUrl, quarter, surveyYear, fields) {
  const outFields = ["quarter", "survey_year", "survey_date", ...fields.map(f => f.name)].join(",");

  const data = await postForm(`${layerUrl}/query`, {
    f: "json",
    where: `quarter='${quarter}' AND survey_year=${Number(surveyYear)}`,
    outFields,
    returnGeometry: "false"
  });

  const feat = data?.features?.[0];
  if (!feat?.attributes) {
    throw new Error(`No record found for ${quarter} ${surveyYear}`);
  }

  return feat.attributes;
}

function createHorizontalBarChart(canvas, title, labels, values) {
  const xAxisLabel =
    title.toLowerCase().includes("employee")
      ? "Number of Employees"
      : "Number of Businesses";

  return new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: title,
        data: values,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      layout: {
        padding: { left: 10, right: 10, top: 0, bottom: 0 }
      },
      plugins: {
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: xAxisLabel
          }
        },
        y: {
          ticks: {
            font: { size: 12 },
            crossAlign: "far"
          },
          afterFit(scale) {
            scale.width = 360;
          }
        }
      }
    }
  });
}

function switchAnalyticsSection(sectionName) {
  analyticsMenuItems.forEach(btn => {
    btn.classList.toggle("analyticsMenuItem--active", btn.dataset.section === sectionName);
  });

  analyticsContentSections.forEach(section => {
    section.classList.toggle(
      "analyticsContentSection--active",
      section.dataset.section === sectionName
    );
  });

  if (sectionName === "origin") {
    setTimeout(() => {
      if (originMap) {
        originMap.invalidateSize();
      }
    }, 50);
  }
}

/* -----------------------------
   SECTION 1: Industry
----------------------------- */
async function loadAnalytics() {
  const quarter = quarterEl?.value;
  const surveyYear = analyticsYearEl?.value;

  if (!surveyYear || !quarter) {
    if (totalBusinessesEl) totalBusinessesEl.textContent = "--";
    if (totalEmployeesEl) totalEmployeesEl.textContent = "--";
    if (topIndustryEl) topIndustryEl.textContent = "--";

    destroyChart(businessChart);
    destroyChart(employeesChart);
    businessChart = null;
    employeesChart = null;
    return;
  }

  const [businessAttrs, employeeAttrs] = await Promise.all([
    getQuarterAttributes(BUSINESS_LAYER_URL, quarter, surveyYear, BUSINESS_FIELDS),
    getQuarterAttributes(EMPLOYEES_LAYER_URL, quarter, surveyYear, EMPLOYEE_FIELDS)
  ]);

  const totalBusinesses = sumValues(businessAttrs, BUSINESS_FIELDS);
  const totalEmployees = sumValues(employeeAttrs, EMPLOYEE_FIELDS);

  totalBusinessesEl.textContent = totalBusinesses.toLocaleString();
  totalEmployeesEl.textContent = totalEmployees.toLocaleString();

  const businessData = buildChartData(businessAttrs, BUSINESS_FIELDS);
  const employeeData = buildChartData(employeeAttrs, EMPLOYEE_FIELDS);

  let topIndustry = "--";
  let topValue = -1;

  EMPLOYEE_FIELDS.forEach(field => {
    const value = Number(employeeAttrs[field.name] ?? 0);
    if (value > topValue) {
      topValue = value;
      topIndustry = field.label;
    }
  });

  topIndustryEl.textContent = topIndustry;

  destroyChart(businessChart);
  destroyChart(employeesChart);

  businessChart = createHorizontalBarChart(
    businessCanvas,
    "Businesses by Industry",
    businessData.labels,
    businessData.values
  );

  employeesChart = createHorizontalBarChart(
    employeesCanvas,
    "Employees by Industry",
    employeeData.labels,
    employeeData.values
  );
}

/* -----------------------------
   SECTION 2: Employees Origin
----------------------------- */
function initOriginMap() {
  if (originMap || !document.getElementById("originMap")) return;

  originMap = L.map("originMap", {
    zoomControl: true
  }).setView([25.7215, -80.2684], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(originMap);

  originMarkersLayer = L.layerGroup().addTo(originMap);
}

function clearOriginMap() {
  if (originMarkersLayer) {
    originMarkersLayer.clearLayers();
  }
}

function getOriginMarkerSize(value) {
  if (value >= 5000) return 52;
  if (value >= 2000) return 46;
  if (value >= 1000) return 42;
  if (value >= 500) return 38;
  if (value >= 100) return 34;
  return 30;
}

function makeOriginDivIcon(value) {
  const size = getOriginMarkerSize(value);

  return L.divIcon({
    className: "origin-map-marker-wrapper",
    html: `
      <div class="origin-map-marker" style="width:${size}px;height:${size}px;">
        <span>${Number(value).toLocaleString()}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
}

function resetOriginAnalyticsUI(message = "Select fiscal year, fiscal quarter, and area type to load the map.") {
  if (originMapMessageEl) originMapMessageEl.textContent = message;
  if (originTotalEmployeesEl) originTotalEmployeesEl.textContent = "--";
  if (originTotalAreasEl) originTotalAreasEl.textContent = "--";
  if (originTopZipEl) originTopZipEl.textContent = "--";
  if (originTopCityEl) originTopCityEl.textContent = "--";

  if (originTopTableBodyEl) {
    originTopTableBodyEl.innerHTML = `
      <tr>
        <td colspan="4" class="analyticsTable__empty">${message}</td>
      </tr>
    `;
  }

  clearOriginMap();
}

function getFiscalQuarterMonths(fiscalYear, quarter) {
  const fy = Number(fiscalYear);

  if (quarter === "Q1") {
    return [
      { year: fy - 1, month: 10 },
      { year: fy - 1, month: 11 },
      { year: fy - 1, month: 12 }
    ];
  }

  if (quarter === "Q2") {
    return [
      { year: fy, month: 1 },
      { year: fy, month: 2 },
      { year: fy, month: 3 }
    ];
  }

  if (quarter === "Q3") {
    return [
      { year: fy, month: 4 },
      { year: fy, month: 5 },
      { year: fy, month: 6 }
    ];
  }

  if (quarter === "Q4") {
    return [
      { year: fy, month: 7 },
      { year: fy, month: 8 },
      { year: fy, month: 9 }
    ];
  }

  return [];
}

async function queryEmployeesOriginFeatures(fiscalYear, quarter, areaType) {
  const safeAreaType = String(areaType).replace(/'/g, "''");
  const months = getFiscalQuarterMonths(fiscalYear, quarter);

  const periodWhere = months
    .map(p => `(report_year = ${p.year} AND report_month = ${p.month})`)
    .join(" OR ");

  const where =
    `(${periodWhere}) ` +
    `AND area_type = '${safeAreaType}'`;

  const data = await postForm(`${EMPLOYEES_ORIGIN_LAYER_URL}/query`, {
    f: "json",
    where,
    outFields: "report_year,report_month,area_type,employees,zipcode,city,lng,lat",
    returnGeometry: "true",
    outSR: "4326"
  });

  return data?.features || [];
}

function getLatLngFromFeature(feature) {
  const attrs = feature.attributes || {};
  const geom = feature.geometry || {};

  if (typeof geom.y === "number" && typeof geom.x === "number") {
    return [geom.y, geom.x];
  }

  if (typeof attrs.lat === "number" && typeof attrs.lng === "number") {
    return [attrs.lat, attrs.lng];
  }

  return null;
}

function buildTopCity(features) {
  const cityTotals = new Map();

  features.forEach(feature => {
    const attrs = feature.attributes || {};
    const city = (attrs.city || "Unknown").toString().trim() || "Unknown";
    const employees = Number(attrs.employees || 0);

    cityTotals.set(city, (cityTotals.get(city) || 0) + employees);
  });

  if (!cityTotals.size) return "--";

  let bestCity = "--";
  let bestValue = -1;

  cityTotals.forEach((value, city) => {
    if (value > bestValue) {
      bestValue = value;
      bestCity = city;
    }
  });

  return bestCity;
}

function updateOriginTable(features) {
  if (!originTopTableBodyEl) return;

  if (!features.length) {
    originTopTableBodyEl.innerHTML = `
      <tr>
        <td colspan="4" class="analyticsTable__empty">No records found for this period of time.</td>
      </tr>
    `;
    return;
  }

  const sorted = [...features]
    .sort((a, b) => Number(b.attributes?.employees || 0) - Number(a.attributes?.employees || 0))
    .slice(0, 10);

  originTopTableBodyEl.innerHTML = sorted.map((feature, index) => {
    const attrs = feature.attributes || {};
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${attrs.zipcode ?? "--"}</td>
        <td>${attrs.city ?? "--"}</td>
        <td>${Number(attrs.employees || 0).toLocaleString()}</td>
      </tr>
    `;
  }).join("");
}

function updateOriginKPIs(features) {
  if (!features.length) {
    originTotalEmployeesEl.textContent = "--";
    originTotalAreasEl.textContent = "--";
    originTopZipEl.textContent = "--";
    originTopCityEl.textContent = "--";
    return;
  }

  const totalEmployees = features.reduce(
    (sum, feature) => sum + Number(feature.attributes?.employees || 0),
    0
  );

  const topRecord = [...features].sort(
    (a, b) => Number(b.attributes?.employees || 0) - Number(a.attributes?.employees || 0)
  )[0];

  originTotalEmployeesEl.textContent = totalEmployees.toLocaleString();
  originTotalAreasEl.textContent = features.length.toLocaleString();
  originTopZipEl.textContent = topRecord?.attributes?.zipcode ?? "--";
  originTopCityEl.textContent = buildTopCity(features);
}

function renderOriginMap(features) {
  initOriginMap();
  clearOriginMap();

  if (!features.length) return;

  const bounds = [];

  features.forEach(feature => {
    const attrs = feature.attributes || {};
    const latLng = getLatLngFromFeature(feature);

    if (!latLng) return;

    const employees = Number(attrs.employees || 0);
    const marker = L.marker(latLng, {
      icon: makeOriginDivIcon(employees)
    });

    marker.bindPopup(`
      <div class="origin-popup">
        <strong>${attrs.city ?? "Unknown City"}</strong><br/>
        ZIP: ${attrs.zipcode ?? "--"}<br/>
        Employees: ${employees.toLocaleString()}<br/>
        Area Type: ${attrs.area_type ?? "--"}<br/>
        Report Period: ${attrs.report_month ?? "--"}/${attrs.report_year ?? "--"}
      </div>
    `);

    marker.addTo(originMarkersLayer);
    bounds.push(latLng);
  });

  if (bounds.length) {
    originMap.fitBounds(bounds, { padding: [30, 30] });
  }
}

async function loadOriginAnalytics() {
  const year = originAnalyticsYearEl?.value;
  const quarter = originAnalyticsQuarterEl?.value;
  const areaType = originAnalyticsAreaTypeEl?.value;

  if (!year || !quarter || !areaType) {
  resetOriginAnalyticsUI("Select fiscal year, fiscal quarter, and area type to load the map.");
  return;
}

  originMapMessageEl.textContent = "Loading employees origin data...";

  try {
    const features = await queryEmployeesOriginFeatures(year, quarter, areaType);

    if (!features.length) {
      resetOriginAnalyticsUI("No records found for this period of time.");
      return;
    }

    originMapMessageEl.textContent =
      `Showing ${features.length.toLocaleString()} origin records for ${areaType}, FY${year} ${quarter}.`;

    updateOriginKPIs(features);
    updateOriginTable(features);
    renderOriginMap(features);
  } catch (err) {
    console.error(err);
    resetOriginAnalyticsUI("Could not load Employees Origin data.");
    alert("Could not load Employees Origin data: " + err.message);
  }
}

/* -----------------------------
   SECTION 3: Office Market Statistics
----------------------------- */

const OFFICE_QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

let officeChart = null;
let officeRentTrendChart = null;
let officeVacancyTrendChart = null;

function formatOfficeMillions(value) {
  return `${(Number(value || 0) / 1_000_000).toFixed(1)}M`;
}

function formatOfficeMillionsWithSuffix(value) {
  return `${(Number(value || 0) / 1_000_000).toFixed(1)}M SF`;
}

function formatOfficePercent(value) {
  return `${Number(value || 0).toFixed(1).replace(".0", "")}%`;
}

function formatOfficeCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function destroyOfficeCharts() {
  if (officeChart) officeChart.destroy();
  if (officeRentTrendChart) officeRentTrendChart.destroy();
  if (officeVacancyTrendChart) officeVacancyTrendChart.destroy();

  officeChart = null;
  officeRentTrendChart = null;
  officeVacancyTrendChart = null;
}

function getOfficeFilters() {
  return {
    year: document.getElementById("officeYear")?.value,
    quarter: document.getElementById("officeQuarter")?.value,
    area: document.getElementById("officeArea")?.value
  };
}

function resetOfficeUI(message = "--") {
  document.getElementById("officeTotalSF").textContent = message;

  document.getElementById("officeA_vacancy").textContent = "--";
  document.getElementById("officeA_rent").textContent = "--";
  document.getElementById("officeA_sf").textContent = "--";

  document.getElementById("officeB_vacancy").textContent = "--";
  document.getElementById("officeB_rent").textContent = "--";
  document.getElementById("officeB_sf").textContent = "--";

  document.getElementById("officeCPlus_vacancy").textContent = "--";
  document.getElementById("officeCPlus_rent").textContent = "--";
  document.getElementById("officeCPlus_sf").textContent = "--";

  const weightedRentEl = document.getElementById("officeWeightedRent");
  const rentSpreadEl = document.getElementById("officeRentSpread");

  if (weightedRentEl) weightedRentEl.textContent = "--";
  if (rentSpreadEl) rentSpreadEl.textContent = "--";

  destroyOfficeCharts();
}

async function queryOfficeFeatures(where, outFields = "*", orderByFields = "") {
  const params = {
    f: "json",
    where,
    outFields,
    returnGeometry: "false"
  };

  if (orderByFields) {
    params.orderByFields = orderByFields;
  }

  const data = await postForm(`${OFFICE_LAYER_URL}/query`, params);
  return data.features || [];
}

function findOfficeClassRecord(features, buildingClass) {
  return features.find(
    f => String(f.attributes?.building_class || "").toUpperCase() === buildingClass
  )?.attributes || null;
}

function updateOfficeCards(classA, classB, classCPlus) {
  const totalSF =
    Number(classA?.total_sf || 0) +
    Number(classB?.total_sf || 0) +
    Number(classCPlus?.total_sf || 0);

  document.getElementById("officeTotalSF").textContent =
    formatOfficeMillionsWithSuffix(totalSF);

  document.getElementById("officeA_vacancy").textContent =
    formatOfficePercent(classA?.vacancy_rate);

  document.getElementById("officeA_rent").textContent =
    formatOfficeCurrency(classA?.market_asking_rent_sf);

  document.getElementById("officeA_sf").textContent =
    formatOfficeMillions(classA?.total_sf);

  document.getElementById("officeB_vacancy").textContent =
    formatOfficePercent(classB?.vacancy_rate);

  document.getElementById("officeB_rent").textContent =
    formatOfficeCurrency(classB?.market_asking_rent_sf);

  document.getElementById("officeB_sf").textContent =
    formatOfficeMillions(classB?.total_sf);

  document.getElementById("officeCPlus_vacancy").textContent =
    formatOfficePercent(classCPlus?.vacancy_rate);

  document.getElementById("officeCPlus_rent").textContent =
    formatOfficeCurrency(classCPlus?.market_asking_rent_sf);

  document.getElementById("officeCPlus_sf").textContent =
    formatOfficeMillions(classCPlus?.total_sf);
}

function updateOfficeHighlights(classA, classB, classCPlus) {
  const classes = [classA, classB, classCPlus].filter(c => Number(c?.total_sf || 0) > 0);

  const totalSF = classes.reduce((sum, c) => sum + Number(c.total_sf || 0), 0);

  const weightedRent =
    totalSF > 0
      ? classes.reduce(
          (sum, c) => sum + Number(c.total_sf || 0) * Number(c.market_asking_rent_sf || 0),
          0
        ) / totalSF
      : 0;

  const rents = classes
    .map(c => Number(c.market_asking_rent_sf || 0))
    .filter(r => Number.isFinite(r) && r > 0);

  const rentSpread = rents.length
    ? Math.max(...rents) - Math.min(...rents)
    : 0;

  document.getElementById("officeWeightedRent").textContent =
  `${formatOfficeCurrency(weightedRent)}/SF`;

document.getElementById("officeRentSpread").textContent =
  `${formatOfficeCurrency(rentSpread)}/SF`;
}

function renderOfficeDonut(classA, classB, classCPlus) {
  const ctx = document.getElementById("officeDonut");
  if (!ctx) return;

  if (officeChart) officeChart.destroy();

  officeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Class A", "Class B", "Class C+"],
      datasets: [{
        data: [
          Number(classA?.total_sf || 0),
          Number(classB?.total_sf || 0),
          Number(classCPlus?.total_sf || 0)
        ],
        backgroundColor: ["#0b6f73", "#d46b08", "#6b7280"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "66%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            boxHeight: 14,
            padding: 16,
            font: {
              size: 13,
              weight: "700"
            }
          }
        }
      }
    }
  });
}

function buildQuarterSeries(historyFeatures, valueField) {
  const classAMap = new Map();
  const classBMap = new Map();
  const classCPlusMap = new Map();

  historyFeatures.forEach(feature => {
    const attrs = feature.attributes || {};
    const quarter = attrs.report_quarter;
    const buildingClass = String(attrs.building_class || "").toUpperCase();
    const value = Number(attrs[valueField] || 0);

    if (!OFFICE_QUARTERS.includes(quarter)) return;

    if (buildingClass === "A") classAMap.set(quarter, value);
    if (buildingClass === "B") classBMap.set(quarter, value);
    if (buildingClass === "C+") classCPlusMap.set(quarter, value);
  });

  return {
    labels: OFFICE_QUARTERS,
    classAValues: OFFICE_QUARTERS.map(q => classAMap.get(q) ?? null),
    classBValues: OFFICE_QUARTERS.map(q => classBMap.get(q) ?? null),
    classCPlusValues: OFFICE_QUARTERS.map(q => classCPlusMap.get(q) ?? null)
  };
}

function createOfficeLineChart(canvasId, labels, aValues, bValues, cPlusValues, yAxisFormatter) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  return new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Class A",
          data: aValues,
          borderColor: "#0b6f73",
          backgroundColor: "rgba(11,111,115,0.12)",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 5
        },
        {
          label: "Class B",
          data: bValues,
          borderColor: "#d46b08",
          backgroundColor: "rgba(212,107,8,0.12)",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 5
        },
        {
          label: "Class C+",
          data: cPlusValues,
          borderColor: "#6b7280",
          backgroundColor: "rgba(107,114,128,0.12)",
          tension: 0.35,
          fill: false,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14,
            boxHeight: 14,
            padding: 16,
            font: {
              size: 13,
              weight: "700"
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: yAxisFormatter
          }
        }
      }
    }
  });
}

function renderOfficeTrendCharts(historyFeatures) {
  if (officeRentTrendChart) officeRentTrendChart.destroy();
  if (officeVacancyTrendChart) officeVacancyTrendChart.destroy();

  const rentSeries = buildQuarterSeries(historyFeatures, "market_asking_rent_sf");
  const vacancySeries = buildQuarterSeries(historyFeatures, "vacancy_rate");

  officeRentTrendChart = createOfficeLineChart(
    "officeRentTrend",
    rentSeries.labels,
    rentSeries.classAValues,
    rentSeries.classBValues,
    rentSeries.classCPlusValues,
    value => `$${Number(value).toFixed(0)}`
  );

  officeVacancyTrendChart = createOfficeLineChart(
    "officeVacancyTrend",
    vacancySeries.labels,
    vacancySeries.classAValues,
    vacancySeries.classBValues,
    vacancySeries.classCPlusValues,
    value => `${Number(value).toFixed(0)}%`
  );
}

async function loadOfficeStats() {
  const { year, quarter, area } = getOfficeFilters();

  if (!year || !quarter || !area) {
    resetOfficeUI();
    return;
  }

  try {
    const currentWhere = `
      report_year = ${Number(year)}
      AND report_quarter = '${quarter}'
      AND area_type = '${String(area).replace(/'/g, "''")}'
    `;

    const historyWhere = `
      report_year = ${Number(year)}
      AND area_type = '${String(area).replace(/'/g, "''")}'
    `;

    const [currentFeatures, historyFeatures] = await Promise.all([
      queryOfficeFeatures(currentWhere),
      queryOfficeFeatures(
        historyWhere,
        "report_year,report_quarter,area_type,building_class,vacancy_rate,market_asking_rent_sf,total_sf",
        "report_quarter ASC"
      )
    ]);

    if (!currentFeatures.length) {
      resetOfficeUI();
      console.warn("No office data found for the selected filters.");
      return;
    }

    const classA = findOfficeClassRecord(currentFeatures, "A");
    const classB = findOfficeClassRecord(currentFeatures, "B");
    const classCPlus = findOfficeClassRecord(currentFeatures, "C+");

    if (!classA && !classB && !classCPlus) {
      resetOfficeUI();
      alert("No Class A / Class B / Class C+ office records were found.");
      return;
    }

    updateOfficeCards(classA || {}, classB || {}, classCPlus || {});
    updateOfficeHighlights(classA || {}, classB || {}, classCPlus || {});
    renderOfficeDonut(classA || {}, classB || {}, classCPlus || {});
    renderOfficeTrendCharts(historyFeatures);
  } catch (err) {
    console.error(err);
    resetOfficeUI();
    alert("Could not load office market statistics: " + err.message);
  }
}


["officeYear", "officeQuarter", "officeArea"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", () => {
    loadOfficeStats();
  });
});


/* -----------------------------
   SECTION 4: Residents / Employees / Visitors
----------------------------- */

const REV_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function resetRevAnalyticsUI(message = "Select year, month, and area type to load statistics.") {
  if (revAnalyticsMessageEl) revAnalyticsMessageEl.textContent = message;

  if (revResidentsValueEl) revResidentsValueEl.textContent = "--";
  if (revEmployeesValueEl) revEmployeesValueEl.textContent = "--";
  if (revVisitorsValueEl) revVisitorsValueEl.textContent = "--";

  if (revResidentsChangeEl) revResidentsChangeEl.textContent = "--";
  if (revEmployeesChangeEl) revEmployeesChangeEl.textContent = "--";
  if (revVisitorsChangeEl) revVisitorsChangeEl.textContent = "--";

  if (revComparisonChart) revComparisonChart.destroy();
  if (revTrendChart) revTrendChart.destroy();

  revComparisonChart = null;
  revTrendChart = null;
}

async function queryRevFeatures(where, outFields = "*", orderByFields = "") {
  const params = {
    f: "json",
    where,
    outFields,
    returnGeometry: "false"
  };

  if (orderByFields) {
    params.orderByFields = orderByFields;
  }

  const data = await postForm(`${REV_LAYER_URL}/query`, params);
  return data.features || [];
}

function getPreviousMonthInfo(year, month) {
  const y = Number(year);
  const m = Number(month);

  if (m === 1) {
    return { year: y - 1, month: 12 };
  }

  return { year: y, month: m - 1 };
}

function formatRevNumber(value) {
  return Number(value || 0).toLocaleString();
}

function calculatePercentChange(currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (!previous) return "N/A";

  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";

  return `${sign}${change.toFixed(1)}%`;
}

function updateRevKPIs(record) {
  const attrs = record?.attributes || {};

  revResidentsValueEl.textContent = formatRevNumber(attrs.residents);
  revEmployeesValueEl.textContent = formatRevNumber(attrs.employees);
  revVisitorsValueEl.textContent = formatRevNumber(attrs.visitors);
}

function setRevChangeValue(element, currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  element.classList.remove(
    "revChangeValue--positive",
    "revChangeValue--negative",
    "revChangeValue--neutral"
  );

  if (!previous) {
    element.textContent = "N/A";
    element.classList.add("revChangeValue--neutral");
    return;
  }

  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "+" : "";

  element.textContent = `${sign}${change.toFixed(1)}%`;

  if (change > 0) {
    element.classList.add("revChangeValue--positive");
  } else if (change < 0) {
    element.classList.add("revChangeValue--negative");
  } else {
    element.classList.add("revChangeValue--neutral");
  }
}

function updateRevPercentChanges(currentRecord, previousRecord) {
  const current = currentRecord?.attributes || {};
  const previous = previousRecord?.attributes || {};

  setRevChangeValue(revResidentsChangeEl, current.residents, previous.residents);
  setRevChangeValue(revEmployeesChangeEl, current.employees, previous.employees);
  setRevChangeValue(revVisitorsChangeEl, current.visitors, previous.visitors);
}


function renderRevComparisonChart(record) {
  const canvas = document.getElementById("revComparisonChart");
  if (!canvas) return;

  if (revComparisonChart) revComparisonChart.destroy();

  const attrs = record?.attributes || {};

  revComparisonChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Residents", "Employees", "Visitors"],
      datasets: [{
        label: "Selected Month",
        data: [
          Number(attrs.residents || 0),
          Number(attrs.employees || 0),
          Number(attrs.visitors || 0)
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => Number(value).toLocaleString()
          }
        }
      }
    }
  });
}

function renderRevTrendChart(features) {
  const canvas = document.getElementById("revTrendChart");
  if (!canvas) return;

  if (revTrendChart) revTrendChart.destroy();

  const monthMap = new Map();

  features.forEach(feature => {
    const attrs = feature.attributes || {};
    monthMap.set(Number(attrs.report_month), attrs);
  });

  const labels = REV_MONTHS;

  const residentsValues = Array.from({ length: 12 }, (_, i) => {
    return Number(monthMap.get(i + 1)?.residents ?? null);
  });

  const employeesValues = Array.from({ length: 12 }, (_, i) => {
    return Number(monthMap.get(i + 1)?.employees ?? null);
  });

  const visitorsValues = Array.from({ length: 12 }, (_, i) => {
    return Number(monthMap.get(i + 1)?.visitors ?? null);
  });

  revTrendChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Residents",
          data: residentsValues,
          borderWidth: 3,
          tension: 0.35
        },
        {
          label: "Employees",
          data: employeesValues,
          borderWidth: 3,
          tension: 0.35
        },
        {
          label: "Visitors",
          data: visitorsValues,
          borderWidth: 3,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => Number(value).toLocaleString()
          }
        }
      }
    }
  });
}

async function loadRevAnalytics() {
  const year = revAnalyticsYearEl?.value;
  const month = revAnalyticsMonthEl?.value;
  const area = revAnalyticsAreaEl?.value;

  if (!year || !month || !area) {
    resetRevAnalyticsUI("Select year, month, and area type to load statistics.");
    return;
  }

  revAnalyticsMessageEl.textContent = "Loading residents, employees, and visitors statistics...";

  try {
    const safeArea = String(area).replace(/'/g, "''");
    const previous = getPreviousMonthInfo(year, month);

    const currentWhere =
      `report_year=${Number(year)} ` +
      `AND report_month=${Number(month)} ` +
      `AND area_type='${safeArea}'`;

    const previousWhere =
      `report_year=${previous.year} ` +
      `AND report_month=${previous.month} ` +
      `AND area_type='${safeArea}'`;

    const trendWhere =
      `report_year=${Number(year)} ` +
      `AND area_type='${safeArea}'`;

    const [currentFeatures, previousFeatures, trendFeatures] = await Promise.all([
      queryRevFeatures(currentWhere),
      queryRevFeatures(previousWhere),
      queryRevFeatures(
        trendWhere,
        "report_year,report_month,area_type,residents,employees,visitors",
        "report_month ASC"
      )
    ]);

    if (!currentFeatures.length) {
      resetRevAnalyticsUI("No statistics found for the selected month.");
      return;
    }

    const currentRecord = currentFeatures[0];
    const previousRecord = previousFeatures[0] || null;

    revAnalyticsMessageEl.textContent =
      `Showing statistics for ${area}, ${REV_MONTHS[Number(month) - 1]} ${year}.`;

    updateRevKPIs(currentRecord);
    updateRevPercentChanges(currentRecord, previousRecord);
    renderRevComparisonChart(currentRecord);
    renderRevTrendChart(trendFeatures);
  } catch (err) {
    console.error(err);
    resetRevAnalyticsUI("Could not load residents, employees, and visitors statistics.");
    alert("Could not load residents, employees, and visitors statistics: " + err.message);
  }
}


/* -----------------------------
   Events
----------------------------- */
if (analyticsYearEl && quarterEl) {
  analyticsYearEl.addEventListener("change", () => {
    loadAnalytics().catch(err => {
      console.error(err);
      alert("Could not load analytics: " + err.message);
    });
  });

  quarterEl.addEventListener("change", () => {
    loadAnalytics().catch(err => {
      console.error(err);
      alert("Could not load analytics: " + err.message);
    });
  });
}

analyticsMenuItems.forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;

    switchAnalyticsSection(section);

    if (section === "office") {
      loadOfficeStats();
    }

    if (section === "rev") {
      loadRevAnalytics();
    }
  });
});

if (originAnalyticsYearEl) {
  originAnalyticsYearEl.addEventListener("change", loadOriginAnalytics);
}

if (originAnalyticsQuarterEl) {
  originAnalyticsQuarterEl.addEventListener("change", loadOriginAnalytics);
}

if (originAnalyticsAreaTypeEl) {
  originAnalyticsAreaTypeEl.addEventListener("change", loadOriginAnalytics);
}

if (revAnalyticsYearEl) {
  revAnalyticsYearEl.addEventListener("change", loadRevAnalytics);
}

if (revAnalyticsMonthEl) {
  revAnalyticsMonthEl.addEventListener("change", loadRevAnalytics);
}

if (revAnalyticsAreaEl) {
  revAnalyticsAreaEl.addEventListener("change", loadRevAnalytics);
}

/* -----------------------------
   Init
----------------------------- */
resetOriginAnalyticsUI();
resetRevAnalyticsUI();
initOriginMap();

loadAnalytics().catch(err => {
  console.error(err);
  alert("Could not load analytics: " + err.message);
});

loadOfficeStats().catch(err => {
  console.error(err);
});