const BUSINESS_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Business_by_Industry/FeatureServer/0";

const EMPLOYEES_LAYER_URL =
  "https://services1.arcgis.com/ug7Y0GY6kYE0tf0p/arcgis/rest/services/Employees_by_Industry/FeatureServer/0";

const BUSINESS_FIELDS = [
  { name: "professional_scientific_technical", label: "Professional, Scientific, and Technical Services" },
  { name: "finance_insurance", label: "Finance and Insurance" },
  { name: "health_care_social_assistance", label: "Health Care and Social Assistance" },
  { name: "retail_trade", label: "Retail Trade" },
  { name: "other_services", label: "Other Services (except Public Administration)" },
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

const quarterEl = document.getElementById("analyticsQuarter");
const businessCanvas = document.getElementById("businessChart");
const employeesCanvas = document.getElementById("employeesChart");
const totalBusinessesEl = document.getElementById("totalBusinesses");
const totalEmployeesEl = document.getElementById("totalEmployees");

let businessChart = null;
let employeesChart = null;

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

async function getQuarterAttributes(layerUrl, quarter, fields) {
  const outFields = ["quarter", "survey_date", ...fields.map(f => f.name)].join(",");

  const data = await postForm(`${layerUrl}/query`, {
    f: "json",
    where: `quarter='${quarter}'`,
    outFields,
    returnGeometry: "false"
  });

  const feat = data?.features?.[0];
  if (!feat?.attributes) {
    throw new Error(`No record found for ${quarter}`);
  }

  return feat.attributes;
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

function destroyChart(chart) {
  if (chart) chart.destroy();
}

function createHorizontalBarChart(canvas, title, labels, values) {
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
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

async function loadAnalytics() {
  const quarter = quarterEl.value;

  const [businessAttrs, employeeAttrs] = await Promise.all([
    getQuarterAttributes(BUSINESS_LAYER_URL, quarter, BUSINESS_FIELDS),
    getQuarterAttributes(EMPLOYEES_LAYER_URL, quarter, EMPLOYEE_FIELDS)
  ]);


    const totalBusinesses = sumValues(businessAttrs, BUSINESS_FIELDS);
    const totalEmployees = sumValues(employeeAttrs, EMPLOYEE_FIELDS);

    totalBusinessesEl.textContent = totalBusinesses.toLocaleString();
    totalEmployeesEl.textContent = totalEmployees.toLocaleString();

    const businessData = buildChartData(businessAttrs, BUSINESS_FIELDS);
    const employeeData = buildChartData(employeeAttrs, EMPLOYEE_FIELDS);

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

quarterEl.addEventListener("change", () => {
  loadAnalytics().catch(err => {
    console.error(err);
    alert("Could not load analytics: " + err.message);
  });
});

loadAnalytics().catch(err => {
  console.error(err);
  alert("Could not load analytics: " + err.message);
});