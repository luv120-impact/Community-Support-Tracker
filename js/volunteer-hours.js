// Student 2 - Volunteer Hours Tracker (Stage One + Stage Two)

const VOLUNTEER_STORAGE_KEY = "volunteerLogs";

// Temporary in-memory data store (kept in sync with storage)
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
 * Resets the in-memory volunteer logs array.
 * Used in tests so each test starts from a clean state.
 */
function resetVolunteerLogs() {
    volunteerLogs = [];
}

/**
 * Load logs from localStorage. If localStorage is not available, returns an empty array.
 * @returns {Array<Object>}
 */
function loadVolunteerLogsFromStorage() {
    if (typeof localStorage === "undefined") {
        return [];
    }

    const raw = localStorage.getItem(VOLUNTEER_STORAGE_KEY);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        console.error("Failed to parse volunteer logs from localStorage", error);
        return [];
    }
}

/**
 * Save logs to localStorage. Does nothing if localStorage is not available.
 * @param {Array<Object>} logs
 */
function saveVolunteerLogsToStorage(logs) {
    if (typeof localStorage === "undefined") {
        return;
    }

    localStorage.setItem(VOLUNTEER_STORAGE_KEY, JSON.stringify(logs));
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
 * (No id here so Stage One tests still pass)
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
    const errorsContainer =
        typeof document !== "undefined"
            ? document.getElementById("volunteer-errors")
            : null;

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
 * Calculates total hours from an array of volunteer logs.
 * @param {Array<Object>} logs
 * @returns {number}
 */
function calculateTotalHours(logs) {
    return logs.reduce((sum, log) => {
        const hours = Number(log.hoursVolunteered);
        return sum + (isNaN(hours) ? 0 : hours);
    }, 0);
}

/**
 * Renders the volunteer logs into the table body.
 * @param {Array<Object>} logs
 */
function renderVolunteerTable(logs) {
    const tbody =
        typeof document !== "undefined"
            ? document.getElementById("volunteer-table-body")
            : null;

    if (!tbody) return;

    tbody.innerHTML = "";

    logs.forEach(log => {
        const row = document.createElement("tr");

        const charityCell = document.createElement("td");
        charityCell.textContent = log.charityName;

        const hoursCell = document.createElement("td");
        hoursCell.textContent = log.hoursVolunteered;

        const dateCell = document.createElement("td");
        dateCell.textContent = log.date;

        const ratingCell = document.createElement("td");
        ratingCell.textContent = log.experienceRating;

        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-log-button");
        if (log.id) {
            deleteButton.dataset.logId = log.id;
        }
        actionsCell.appendChild(deleteButton);

        row.appendChild(charityCell);
        row.appendChild(hoursCell);
        row.appendChild(dateCell);
        row.appendChild(ratingCell);
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });
}

/**
 * Renders the total hours value in the summary section.
 * @param {Array<Object>} logs
 */
function renderTotalHours(logs) {
    const totalElement =
        typeof document !== "undefined"
            ? document.getElementById("total-hours-value")
            : null;

    if (!totalElement) return;

    const total = calculateTotalHours(logs);
    totalElement.textContent = total.toString();
}

/**
 * Handles volunteer form submission.
 * - Prevents default submit
 * - Builds data from form
 * - Validates data
 * - Shows errors or updates data, storage, table, and summary
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

    // Stage Two: load current logs from storage, add new log with id, save, and update UI
    let logs = loadVolunteerLogsFromStorage();
    const newLogWithId = {
        ...log,
        id: Date.now().toString()
    };

    logs.push(newLogWithId);
    saveVolunteerLogsToStorage(logs);

    // Keep in-memory array in sync (mainly for tests)
    volunteerLogs = logs;

    renderVolunteerTable(logs);
    renderTotalHours(logs);

    // Reset form after successful submission
    form.reset();
}

/**
 * Handles click events on the volunteer table (for delete buttons).
 * @param {MouseEvent} event
 */
function handleVolunteerTableClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (!target.classList.contains("delete-log-button")) return;

    const logId = target.dataset.logId;
    if (!logId) return;

    let logs = loadVolunteerLogsFromStorage();
    const updatedLogs = logs.filter(log => log.id !== logId);

    saveVolunteerLogsToStorage(updatedLogs);
    volunteerLogs = updatedLogs;

    renderVolunteerTable(updatedLogs);
    renderTotalHours(updatedLogs);
}

/**
 * Initializes the volunteer hours page on DOMContentLoaded:
 * - Connects form submit handler
 * - Connects table delete handler
 * - Loads data from localStorage and renders table + summary
 */
function initVolunteerForm() {
    const form =
        typeof document !== "undefined"
            ? document.getElementById("volunteer-form")
            : null;

    if (form) {
        form.addEventListener("submit", handleVolunteerFormSubmit);
    }

    // Load existing data from storage and render
    const logs = loadVolunteerLogsFromStorage();
    volunteerLogs = logs;
    renderVolunteerTable(logs);
    renderTotalHours(logs);

    const tableBody =
        typeof document !== "undefined"
            ? document.getElementById("volunteer-table-body")
            : null;

    if (tableBody) {
        tableBody.addEventListener("click", handleVolunteerTableClick);
    }
}

// Only attach event listener when running in a browser (not during Node import)
if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initVolunteerForm);
}

// Export pure/testable functions for Jest (Node/CommonJS environment)
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        validateVolunteerData,
        buildVolunteerLogFromForm,
        handleVolunteerFormSubmit,
        getVolunteerLogs,
        resetVolunteerLogs,
        loadVolunteerLogsFromStorage,
        saveVolunteerLogsToStorage,
        calculateTotalHours,
        renderVolunteerTable,
        renderTotalHours,
        handleVolunteerTableClick
    };
}
