// Stage One - Student 2 (Volunteer Hours Tracker)

// Temporary in-memory data store for Stage One
let volunteerLogs = [];

/**
 * Returns a shallow copy of current volunteer logs.
 * Used in tests to verify that form submission updated the data.
 * @returns {Array<Object>}
 */
function getVolunteerLogs() {
    return [...volunteerLogs];
}

/**
 * Validates a volunteer log data object.
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: Object<string,string> }}
 */
function validateVolunteerData(data) {
    const errors = {};

    if (!data.charityName || data.charityName.trim() === "") {
        errors.charityName = "Charity name is required.";
    }

    if (
        data.hoursVolunteered === "" ||
        data.hoursVolunteered === null ||
        data.hoursVolunteered === undefined
    ) {
        errors.hoursVolunteered = "Hours volunteered is required.";
    } else {
        const hoursNumber = Number(data.hoursVolunteered);
        if (isNaN(hoursNumber) || hoursNumber <= 0) {
            errors.hoursVolunteered = "Hours volunteered must be a positive number.";
        }
    }

    if (!data.date || data.date.trim() === "") {
        errors.date = "Date is required.";
    }

    if (
        data.experienceRating === "" ||
        data.experienceRating === null ||
        data.experienceRating === undefined
    ) {
        errors.experienceRating = "Experience rating is required.";
    } else {
        const ratingNumber = Number(data.experienceRating);
        if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
            errors.experienceRating = "Experience rating must be a number between 1 and 5.";
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Builds a volunteer log object from the volunteer form.
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function buildVolunteerLogFromForm(form) {
    const charityName = form.elements["charityName"].value;
    const hoursVolunteered = form.elements["hoursVolunteered"].value;
    const date = form.elements["date"].value;
    const experienceRating = form.elements["experienceRating"].value;

    return {
        charityName,
        hoursVolunteered,
        date,
        experienceRating
    };
}

/**
 * Renders validation errors into the volunteer-errors container.
 * @param {Object<string,string>} errors
 */
function renderVolunteerErrors(errors) {
    const errorsContainer = document.getElementById("volunteer-errors");
    if (!errorsContainer) return;

    if (!errors || Object.keys(errors).length === 0) {
        errorsContainer.innerHTML = "";
        return;
    }

    const listItems = Object.values(errors)
        .map(message => `<li>${message}</li>`)
        .join("");

    errorsContainer.innerHTML = `
        <div class="error-box">
            <p>Please fix the following problems:</p>
            <ul>${listItems}</ul>
        </div>
    `;
}

/**
 * Handles volunteer form submission.
 * - Prevents default submit
 * - Builds data from form
 * - Validates data
 * - Shows errors or updates temporary data array
 * @param {SubmitEvent} event
 */
function handleVolunteerFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const log = buildVolunteerLogFromForm(form);
    const validation = validateVolunteerData(log);

    if (!validation.isValid) {
        renderVolunteerErrors(validation.errors);
        return;
    }

    // Clear errors
    renderVolunteerErrors({});

    // Stage One: just store in temporary in-memory array
    volunteerLogs.push(log);

    // For Stage One, we can just log to console for debugging
    console.log("Volunteer logs:", volunteerLogs);

    // Reset form after successful submission
    form.reset();
}

/**
 * Initializes the volunteer hours form event listener on DOMContentLoaded.
 */
function initVolunteerForm() {
    const form = document.getElementById("volunteer-form");
    if (form) {
        form.addEventListener("submit", handleVolunteerFormSubmit);
    }
}

document.addEventListener("DOMContentLoaded", initVolunteerForm);

// Export pure/testable functions for Jest (Node/CommonJS environment)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        validateVolunteerData,
        buildVolunteerLogFromForm,
        handleVolunteerFormSubmit,
        getVolunteerLogs
    };
}
