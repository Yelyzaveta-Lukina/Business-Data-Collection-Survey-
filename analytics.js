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

const compareQuarterAEl = document.getElementById("compareQuarterA");
const compareQuarterBEl = document.getElementById("compareQuarterB");
const businessChangeEl = document.getElementById("businessChange");
const employeeChangeEl = document.getElementById("employeeChange");
const comparisonSummaryEl = document.getElementById("comparisonSummary");
const businessCompareCanvas = document.getElementById("businessCompareChart");
const employeesCompareCanvas = document.getElementById("employeesCompareChart");

const topGrowthIndustryEl = document.getElementById("topGrowthIndustry");
const topGrowthDetailEl = document.getElementById("topGrowthDetail");
const topDeclineIndustryEl = document.getElementById("topDeclineIndustry");
const topDeclineDetailEl = document.getElementById("topDeclineDetail");

let businessChart = null;
let employeesChart = null;
let businessCompareChart = null;
let employeesCompareChart = null;

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

function formatSignedNumber(value) {
  const sign = value > 0 ? "+" : "";
  return sign + value.toLocaleString();
}

function formatSignedPercent(value) {
  const sign = value > 0 ? "+" : "";
  return sign + value.toFixed(1) + "%";
}

function calculatePercentChange(oldValue, newValue) {
  if (oldValue === 0) {
    if (newValue === 0) return 0;
    return 100;
  }
  return ((newValue - oldValue) / oldValue) * 100;
}

function quarterToText(q) {
  const map = {
    Q1: "the first quarter",
    Q2: "the second quarter",
    Q3: "the third quarter",
    Q4: "the fourth quarter"
  };
  return map[q] || q;
}


function setChangeStyle(el, value) {
  el.classList.remove("analyticsTotalCard__value--positive", "analyticsTotalCard__value--negative");

  if (value > 0) {
    el.classList.add("analyticsTotalCard__value--positive");
  } else if (value < 0) {
    el.classList.add("analyticsTotalCard__value--negative");
  }
}

function findTopGrowth(fields, attrsA, attrsB) {
  let top = null;

  fields.forEach(f => {
    const a = Number(attrsA[f.name] ?? 0);
    const b = Number(attrsB[f.name] ?? 0);
    const diff = b - a;

    if (!top || diff > top.diff) {
      top = {
        label: f.label,
        diff,
        from: a,
        to: b
      };
    }
  });

  return top;
}

function findTopDecline(fields, attrsA, attrsB) {
  let top = null;

  fields.forEach(f => {
    const a = Number(attrsA[f.name] ?? 0);
    const b = Number(attrsB[f.name] ?? 0);
    const diff = b - a;

    if (!top || diff < top.diff) {
      top = {
        label: f.label,
        diff,
        from: a,
        to: b
      };
    }
  });

  return top;
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
        legend: { display: false },
        title: { display: false }
      },
      scales: {
        x: { beginAtZero: true }
      }
    }
  });
}

function createComparisonBarChart(canvas, labelA, labelB, labels, valuesA, valuesB) {
  return new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: labelA,
          data: valuesA,
          borderWidth: 1
        },
        {
          label: labelB,
          data: valuesB,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: {
          display: true,
          position: "top"
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

async function loadComparisonAnalytics() {
  const quarterA = compareQuarterAEl.value;
  const quarterB = compareQuarterBEl.value;

  if (quarterA === quarterB) {
    businessChangeEl.textContent = "--";
    employeeChangeEl.textContent = "--";
    topGrowthIndustryEl.textContent = "--";
    topGrowthDetailEl.textContent = "--";
    topDeclineIndustryEl.textContent = "--";
    topDeclineDetailEl.textContent = "--";

    businessChangeEl.classList.remove("analyticsTotalCard__value--positive", "analyticsTotalCard__value--negative");
    employeeChangeEl.classList.remove("analyticsTotalCard__value--positive", "analyticsTotalCard__value--negative");

    comparisonSummaryEl.textContent = "Please select two different quarters to compare.";
    comparisonSummaryEl.classList.add("comparisonSummary--warn");

    destroyChart(businessCompareChart);
    destroyChart(employeesCompareChart);
    businessCompareChart = null;
    employeesCompareChart = null;

    return;
  }

  comparisonSummaryEl.classList.remove("comparisonSummary--warn");

  const [businessAttrsA, businessAttrsB, employeeAttrsA, employeeAttrsB] = await Promise.all([
    getQuarterAttributes(BUSINESS_LAYER_URL, quarterA, BUSINESS_FIELDS),
    getQuarterAttributes(BUSINESS_LAYER_URL, quarterB, BUSINESS_FIELDS),
    getQuarterAttributes(EMPLOYEES_LAYER_URL, quarterA, EMPLOYEE_FIELDS),
    getQuarterAttributes(EMPLOYEES_LAYER_URL, quarterB, EMPLOYEE_FIELDS)
  ]);

  const totalBusinessesA = sumValues(businessAttrsA, BUSINESS_FIELDS);
  const totalBusinessesB = sumValues(businessAttrsB, BUSINESS_FIELDS);
  const totalEmployeesA = sumValues(employeeAttrsA, EMPLOYEE_FIELDS);
  const totalEmployeesB = sumValues(employeeAttrsB, EMPLOYEE_FIELDS);

  const businessDataA = buildChartData(businessAttrsA, BUSINESS_FIELDS);
  const businessDataB = buildChartData(businessAttrsB, BUSINESS_FIELDS);
  const employeeDataA = buildChartData(employeeAttrsA, EMPLOYEE_FIELDS);
  const employeeDataB = buildChartData(employeeAttrsB, EMPLOYEE_FIELDS);

  const businessChange = totalBusinessesB - totalBusinessesA;
  const employeeChange = totalEmployeesB - totalEmployeesA;

  const businessPercent = calculatePercentChange(totalBusinessesA, totalBusinessesB);
  const employeePercent = calculatePercentChange(totalEmployeesA, totalEmployeesB);

  businessChangeEl.textContent =
    `${formatSignedNumber(businessChange)} (${formatSignedPercent(businessPercent)})`;

  employeeChangeEl.textContent =
    `${formatSignedNumber(employeeChange)} (${formatSignedPercent(employeePercent)})`;

  setChangeStyle(businessChangeEl, businessChange);
  setChangeStyle(employeeChangeEl, employeeChange);

  const quarterAText = quarterToText(quarterA);
  const quarterBText = quarterToText(quarterB);

  const businessDirection =
    businessChange > 0 ? "increased" :
    businessChange < 0 ? "decreased" :
    "did not change";

  const employeeDirection =
    employeeChange > 0 ? "increased" :
    employeeChange < 0 ? "decreased" :
    "did not change";

  comparisonSummaryEl.textContent =
    `During ${quarterAText}, total businesses were ${totalBusinessesA.toLocaleString()} and total employees were ${totalEmployeesA.toLocaleString()}. ` +
    `During ${quarterBText}, total businesses were ${totalBusinessesB.toLocaleString()} and total employees were ${totalEmployeesB.toLocaleString()}. ` +
    `From ${quarterAText} to ${quarterBText}, the number of businesses ${businessDirection} by ${Math.abs(businessChange).toLocaleString()} (${formatSignedPercent(businessPercent)}), ` +
    `while total employees ${employeeDirection} by ${Math.abs(employeeChange).toLocaleString()} (${formatSignedPercent(employeePercent)}).`;

  const topGrowth = findTopGrowth(BUSINESS_FIELDS, businessAttrsA, businessAttrsB);
  const topDecline = findTopDecline(BUSINESS_FIELDS, businessAttrsA, businessAttrsB);

  if (topGrowth && topGrowth.diff > 0) {
    topGrowthIndustryEl.textContent = topGrowth.label;
    topGrowthDetailEl.textContent =
      `+${topGrowth.diff.toLocaleString()} from ${topGrowth.from.toLocaleString()} to ${topGrowth.to.toLocaleString()}`;
  } else if (topGrowth && topGrowth.diff === 0) {
    topGrowthIndustryEl.textContent = "No growth";
    topGrowthDetailEl.textContent = "No industry increased between selected quarters.";
  } else {
    topGrowthIndustryEl.textContent = "No growth";
    topGrowthDetailEl.textContent = "All industries declined or stayed the same.";
  }

  if (topDecline && topDecline.diff < 0) {
    topDeclineIndustryEl.textContent = topDecline.label;
    topDeclineDetailEl.textContent =
      `${topDecline.diff.toLocaleString()} from ${topDecline.from.toLocaleString()} to ${topDecline.to.toLocaleString()}`;
  } else if (topDecline && topDecline.diff === 0) {
    topDeclineIndustryEl.textContent = "No decline";
    topDeclineDetailEl.textContent = "No industry decreased between selected quarters.";
  } else {
    topDeclineIndustryEl.textContent = "No decline";
    topDeclineDetailEl.textContent = "All industries increased or stayed the same.";
  }

  destroyChart(businessCompareChart);
  destroyChart(employeesCompareChart);

  businessCompareChart = createComparisonBarChart(
    businessCompareCanvas,
    quarterA,
    quarterB,
    businessDataA.labels,
    businessDataA.values,
    businessDataB.values
  );

  employeesCompareChart = createComparisonBarChart(
    employeesCompareCanvas,
    quarterA,
    quarterB,
    employeeDataA.labels,
    employeeDataA.values,
    employeeDataB.values
  );
}

quarterEl.addEventListener("change", () => {
  loadAnalytics().catch(err => {
    console.error(err);
    alert("Could not load analytics: " + err.message);
  });
});

compareQuarterAEl.addEventListener("change", () => {
  loadComparisonAnalytics().catch(err => {
    console.error(err);
    alert("Could not load comparison analytics: " + err.message);
  });
});

compareQuarterBEl.addEventListener("change", () => {
  loadComparisonAnalytics().catch(err => {
    console.error(err);
    alert("Could not load comparison analytics: " + err.message);
  });
});

loadAnalytics().catch(err => {
  console.error(err);
  alert("Could not load analytics: " + err.message);
});

loadComparisonAnalytics().catch(err => {
  console.error(err);
  alert("Could not load comparison analytics: " + err.message);
});