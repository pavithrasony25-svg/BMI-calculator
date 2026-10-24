// ==========================================================================
// Simple & Beginner-Friendly JavaScript for BMI Calculator
// ==========================================================================

// Function to calculate BMI when the user clicks "Calculate My BMI"
function calculateBMI() {
    // 1. Read input values from the HTML fields
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const age = document.getElementById('age').value;

    // 2. Validate that height and weight are valid positive numbers
    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
        alert("Please enter valid positive numbers for height and weight!");
        return;
    }

    // 3. BMI Formula: weight (kg) / [height (in meters)]²
    // Convert height from centimeters (cm) to meters (m)
    const heightInMeters = height / 100;

    // Calculate BMI and round to 1 decimal place using .toFixed(1)
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // 4. Variables to hold the category name, advice message, and styling class
    let category = "";
    let advice = "";
    let badgeClass = "";

    // Simple if-else condition following World Health Organization (WHO) rules
    if (bmi < 18.5) {
        category = "Underweight";
        advice = "Your BMI suggests you are below the ideal weight range. Enjoy nutrient-rich meals with healthy fats and proteins.";
        badgeClass = "badge-underweight";
    } else if (bmi >= 18.5 && bmi < 24.9) {
        category = "Normal / Healthy Weight";
        advice = "Awesome! Your BMI is in the healthy zone. Continue eating wholesome foods and staying physically active.";
        badgeClass = "badge-normal";
    } else if (bmi >= 25.0 && bmi < 29.9) {
        category = "Overweight";
        advice = "Your BMI is slightly above the healthy range. Adding daily 30-minute walks and portion control can help.";
        badgeClass = "badge-overweight";
    } else {
        category = "Obese";
        advice = "Your BMI is in the obese category. Consider speaking with a doctor or certified dietitian for personalized guidance.";
        badgeClass = "badge-obese";
    }

    // 5. Update the HTML elements to show the results
    document.getElementById('resultBmiNumber').innerText = bmi;
    document.getElementById('resultCategoryBadge').innerText = category;
    document.getElementById('resultCategoryBadge').className = "badge category-badge px-3 py-1.5 rounded-pill fw-bold fs-6 " + badgeClass;
    document.getElementById('resultAdvice').innerText = advice;

    // 6. Make the result card visible
    document.getElementById('resultBox').style.display = "block";
}

// Function to reset all inputs and hide the result card
function resetForm() {
    // Clear all text inputs
    document.getElementById('height').value = "";
    document.getElementById('weight').value = "";
    document.getElementById('age').value = "";

    // Reset gender radio to Male by default
    document.getElementById('male').checked = true;

    // Hide the result card
    document.getElementById('resultBox').style.display = "none";
}
