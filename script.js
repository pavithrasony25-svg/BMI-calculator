/**
 * Smart BMI Calculator - Core JavaScript Logic
 * Standard Metric Unit System (cm / kg), WHO-standard BMI calculation,
 * dynamic speedometer gauge needle rotation, and health guidance.
 */

// Application State (Metric: cm and kg)
const appState = {
    gender: 'male',
    age: 25,
    heightCm: 170,
    weightKg: 65,
    lastComputed: {
        bmi: 22.5,
        category: 'Normal / Healthy',
        idealMinKg: 53.5,
        idealMaxKg: 72.0,
        bmr: 1620
    }
};

// DOM Cache
const dom = {
    cardMale: document.getElementById('cardMale'),
    cardFemale: document.getElementById('cardFemale'),

    ageInput: document.getElementById('ageInput'),
    ageRange: document.getElementById('ageRange'),

    heightInput: document.getElementById('heightInput'),
    heightRange: document.getElementById('heightRange'),
    heightUnitTag: document.getElementById('heightUnitTag'),
    heightMinLabel: document.getElementById('heightMinLabel'),
    heightMaxLabel: document.getElementById('heightMaxLabel'),

    weightInput: document.getElementById('weightInput'),
    weightRange: document.getElementById('weightRange'),
    weightUnitTag: document.getElementById('weightUnitTag'),
    weightMinLabel: document.getElementById('weightMinLabel'),
    weightMaxLabel: document.getElementById('weightMaxLabel'),

    // Gauge & Needle
    svgNeedleGroup: document.getElementById('svgNeedleGroup'),
    gaugeStatusText: document.getElementById('gaugeStatusText'),
    healthyRangeText: document.getElementById('healthyRangeText'),
    bmrValue: document.getElementById('bmrValue'),

    // Outputs
    bmiNumberDisplay: document.getElementById('bmiNumberDisplay'),
    bmiCategoryBadge: document.getElementById('bmiCategoryBadge'),
    idealWeightDisplay: document.getElementById('idealWeightDisplay'),
    heightEcho: document.getElementById('heightEcho'),
    healthRiskDisplay: document.getElementById('healthRiskDisplay'),
    adviceParagraph: document.getElementById('adviceParagraph'),

    // Reference Table Rows
    rowUnderweight: document.getElementById('rowUnderweight'),
    rowNormal: document.getElementById('rowNormal'),
    rowOverweight: document.getElementById('rowOverweight'),
    rowObese: document.getElementById('rowObese')
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Add real-time event listeners to all controls
    ['input', 'change'].forEach(eventType => {
        if (dom.heightInput) dom.heightInput.addEventListener(eventType, syncHeightFromNumber);
        if (dom.heightRange) dom.heightRange.addEventListener(eventType, syncHeightFromRange);
        if (dom.weightInput) dom.weightInput.addEventListener(eventType, syncWeightFromNumber);
        if (dom.weightRange) dom.weightRange.addEventListener(eventType, syncWeightFromRange);
        if (dom.ageInput) dom.ageInput.addEventListener(eventType, syncAgeFromNumber);
        if (dom.ageRange) dom.ageRange.addEventListener(eventType, syncAgeFromRange);
    });

    computeBMI();
});

/**
 * Switch Gender
 */
function selectGender(gender) {
    appState.gender = gender;
    if (gender === 'male') {
        dom.cardMale.classList.add('active');
        dom.cardFemale.classList.remove('active');
    } else {
        dom.cardFemale.classList.add('active');
        dom.cardMale.classList.remove('active');
    }
    computeBMI();
}

/**
 * Value synchronizations (Metric: cm and kg)
 */
function syncAgeFromNumber() {
    let val = parseInt(dom.ageInput.value, 10) || 2;
    val = Math.max(2, Math.min(120, val));
    dom.ageRange.value = val;
    appState.age = val;
    computeBMI();
}

function syncAgeFromRange() {
    let val = parseInt(dom.ageRange.value, 10);
    dom.ageInput.value = val;
    appState.age = val;
    computeBMI();
}

function syncHeightFromNumber() {
    let val = parseFloat(dom.heightInput.value) || 0;
    dom.heightRange.value = val;
    appState.heightCm = val;
    computeBMI();
}

function syncHeightFromRange() {
    let val = parseFloat(dom.heightRange.value);
    dom.heightInput.value = val;
    appState.heightCm = val;
    computeBMI();
}

function syncWeightFromNumber() {
    let val = parseFloat(dom.weightInput.value) || 0;
    dom.weightRange.value = val;
    appState.weightKg = val;
    computeBMI();
}

function syncWeightFromRange() {
    let val = parseFloat(dom.weightRange.value);
    dom.weightInput.value = val;
    appState.weightKg = val;
    computeBMI();
}

/**
 * Quick preset helpers
 */
function setHeight(val) {
    dom.heightInput.value = val;
    dom.heightRange.value = val;
    appState.heightCm = val;
    computeBMI();
}

function setWeight(val) {
    dom.weightInput.value = val;
    dom.weightRange.value = val;
    appState.weightKg = val;
    computeBMI();
}

/**
 * Main BMI Calculation
 * BMI = weight (kg) / [height (m)]^2
 */
function computeBMI() {
    const heightMeters = appState.heightCm / 100;
    const weightKg = appState.weightKg;

    if (heightMeters <= 0 || weightKg <= 0) {
        return;
    }

    const bmi = weightKg / (heightMeters * heightMeters);
    const formattedBMI = bmi.toFixed(1);

    // Calculate Ideal Weight Range for this height (WHO range: 18.5 - 24.9 kg/m²)
    const minIdealKg = 18.5 * (heightMeters * heightMeters);
    const maxIdealKg = 24.9 * (heightMeters * heightMeters);

    // Calculate BMR (Mifflin-St Jeor equation)
    let bmr = (10 * weightKg) + (6.25 * appState.heightCm) - (5 * appState.age);
    bmr += (appState.gender === 'male' ? 5 : -161);
    bmr = Math.round(bmr);

    // Determine Category, Health Risk, Advice, and Gauge Needle Angle
    let category = '';
    let categoryClass = '';
    let healthRisk = '';
    let advice = '';
    let needleAngle = 0; // -90deg (far left, underweight) to +90deg (far right, obese)

    // Clear active table rows
    [dom.rowUnderweight, dom.rowNormal, dom.rowOverweight, dom.rowObese].forEach(r => {
        if (r) r.classList.remove('table-active-row');
    });

    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'badge bg-sky-subtle text-sky';
        healthRisk = 'Nutritional Risk';
        advice = 'Focus on nutrient-dense meals including nuts, whole grains, avocados, and healthy proteins. Resistance training is recommended to build lean muscle mass.';
        if (dom.rowUnderweight) dom.rowUnderweight.classList.add('table-active-row');
        
        // Gauge needle: maps 10 to 18.5 -> -90deg to -45deg
        const progress = Math.max(0, Math.min(1, (bmi - 10) / 8.5));
        needleAngle = -90 + (progress * 45);
    } else if (bmi < 25.0) {
        category = 'Normal & Healthy Weight';
        categoryClass = 'badge bg-emerald-subtle text-emerald';
        healthRisk = 'Minimal Risk';
        advice = 'Great job! Maintain your current balanced diet with fresh produce and quality proteins. Keep up regular aerobic activities and strength exercises.';
        if (dom.rowNormal) dom.rowNormal.classList.add('table-active-row');
        
        // Gauge needle: maps 18.5 to 25.0 -> -45deg to 0deg
        const progress = (bmi - 18.5) / 6.5;
        needleAngle = -45 + (progress * 45);
    } else if (bmi < 30.0) {
        category = 'Overweight';
        categoryClass = 'badge bg-amber-subtle text-amber';
        healthRisk = 'Moderate Risk';
        advice = 'Aim for portion control and reduce refined sugars and processed fats. Increase daily physical movement (target 8,000+ daily steps) and consider consulting a dietitian.';
        if (dom.rowOverweight) dom.rowOverweight.classList.add('table-active-row');
        
        // Gauge needle: maps 25.0 to 30.0 -> 0deg to +45deg
        const progress = (bmi - 25.0) / 5.0;
        needleAngle = 0 + (progress * 45);
    } else {
        category = 'Obese';
        categoryClass = 'badge bg-rose-subtle text-rose';
        healthRisk = 'High Health Risk';
        advice = 'Consider consulting a healthcare provider or nutritionist for a structured wellness roadmap. Gradual, sustainable weight loss through gentle exercise and calorie balance is advised.';
        if (dom.rowObese) dom.rowObese.classList.add('table-active-row');
        
        // Gauge needle: maps 30.0 to 45.0 -> +45deg to +90deg
        const progress = Math.min(1, (bmi - 30.0) / 15.0);
        needleAngle = 45 + (progress * 45);
    }

    // Save state
    appState.lastComputed = {
        bmi: formattedBMI,
        category,
        idealMinKg: minIdealKg,
        idealMaxKg: maxIdealKg,
        bmr
    };

    // Update UI elements
    dom.bmiNumberDisplay.textContent = formattedBMI;
    dom.bmiCategoryBadge.textContent = category;
    dom.bmiCategoryBadge.className = categoryClass + ' px-3 py-1 rounded-pill fw-bold';
    dom.healthRiskDisplay.textContent = healthRisk;
    dom.adviceParagraph.textContent = advice;

    // Ideal weight display text (Metric)
    dom.idealWeightDisplay.textContent = `${minIdealKg.toFixed(1)} – ${maxIdealKg.toFixed(1)} kg`;
    dom.healthyRangeText.innerHTML = `Healthy weight for your height: <strong class="text-white">${minIdealKg.toFixed(1)} – ${maxIdealKg.toFixed(1)} kg</strong>`;
    dom.heightEcho.textContent = `${Math.round(appState.heightCm)} cm`;

    dom.bmrValue.textContent = `~ ${bmr.toLocaleString()} kcal/day`;
    dom.gaugeStatusText.textContent = category;

    // Apply color class to gauge text
    if (bmi < 18.5) dom.gaugeStatusText.className = 'mt-4 fw-bold fs-4 text-sky';
    else if (bmi < 25.0) dom.gaugeStatusText.className = 'mt-4 fw-bold fs-4 text-emerald';
    else if (bmi < 30.0) dom.gaugeStatusText.className = 'mt-4 fw-bold fs-4 text-amber';
    else dom.gaugeStatusText.className = 'mt-4 fw-bold fs-4 text-rose';

    // Rotate Speedometer Needle (both SVG attribute and CSS transform for cross-browser reliability)
    if (dom.svgNeedleGroup) {
        dom.svgNeedleGroup.setAttribute('transform', `rotate(${needleAngle.toFixed(1)}, 130, 130)`);
        dom.svgNeedleGroup.style.transform = `rotate(${needleAngle.toFixed(1)}deg)`;
    }
}

/**
 * Reset Form to Defaults (Metric)
 */
function resetForm() {
    appState.gender = 'male';
    dom.cardMale.classList.add('active');
    dom.cardFemale.classList.remove('active');

    appState.age = 25;
    dom.ageInput.value = 25;
    dom.ageRange.value = 25;

    appState.heightCm = 170;
    appState.weightKg = 65;

    dom.heightInput.value = 170;
    dom.heightRange.value = 170;
    dom.weightInput.value = 65;
    dom.weightRange.value = 65;

    computeBMI();
}
