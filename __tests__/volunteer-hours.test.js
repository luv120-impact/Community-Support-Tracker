/**
 * @jest-environment jsdom
 *
 * Jest tests for Student 2 - Volunteer Hours Tracker (Stage One + Stage Two)
 */

const {
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
} = require("../js/volunteer-hours.js");

describe("validateVolunteerData", () => {
    test("returns isValid=true for correct data", () => {
        const data = {
            charityName: "Community Shelter",
            hoursVolunteered: "3",
            date: "2025-11-28",
            experienceRating: "4"
        };

        const result = validateVolunteerData(data);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
    });

    test("detects empty required fields", () => {
        const data = {
            charityName: "",
            hoursVolunteered: "",
            date: "",
            experienceRating: ""
        };

        const result = validateVolunteerData(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.charityName).toBeDefined();
        expect(result.errors.hoursVolunteered).toBeDefined();
        expect(result.errors.date).toBeDefined();
        expect(result.errors.experienceRating).toBeDefined();
    });

    test("flags invalid hours and rating", () => {
        const data = {
            charityName: "Food Bank",
            hoursVolunteered: "-5",
            date: "2025-11-28",
            experienceRating: "10"
        };

        const result = validateVolunteerData(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.hoursVolunteered).toBeDefined();
        expect(result.errors.experienceRating).toBeDefined();
    });
});

describe("buildVolunteerLogFromForm", () => {
    beforeEach(() => {
        resetVolunteerLogs();
    });

    test("builds a correct data object from form elements", () => {
        document.body.innerHTML = `
            <form id="volunteer-form">
                <input type="text" name="charityName" value="Animal Rescue" />
                <input type="number" name="hoursVolunteered" value="4" />
                <input type="date" name="date" value="2025-11-15" />
                <select name="experienceRating">
                    <option value="">Select...</option>
                    <option value="5" selected>5</option>
                </select>
            </form>
        `;

        const form = document.getElementById("volunteer-form");
        const log = buildVolunteerLogFromForm(form);

        expect(log).toEqual({
            charityName: "Animal Rescue",
            hoursVolunteered: "4",
            date: "2025-11-15",
            experienceRating: "5"
        });
    });
});

describe("Integration: Stage One form submission and DOM errors", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="volunteer-errors"></div>
            <form id="volunteer-form">
                <input type="text" id="charity-name" name="charityName" />
                <input type="number" id="hours-volunteered" name="hoursVolunteered" />
                <input type="date" id="volunteer-date" name="date" />
                <select id="experience-rating" name="experienceRating">
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </form>
        `;
        resetVolunteerLogs();
        if (typeof localStorage !== "undefined") {
            localStorage.clear();
        }
    });

    test("submitting valid form updates temporary data object", () => {
        const form = document.getElementById("volunteer-form");

        form.elements["charityName"].value = "Library Volunteer Program";
        form.elements["hoursVolunteered"].value = "2.5";
        form.elements["date"].value = "2025-11-10";
        form.elements["experienceRating"].value = "4";

        const fakeEvent = {
            preventDefault: jest.fn(),
            target: form
        };

        handleVolunteerFormSubmit(fakeEvent);

        const logs = getVolunteerLogs();
        expect(logs.length).toBe(1);

        const lastLog = logs[logs.length - 1];
        expect(lastLog.charityName).toBe("Library Volunteer Program");
        expect(lastLog.hoursVolunteered).toBe("2.5");
        expect(lastLog.date).toBe("2025-11-10");
        expect(lastLog.experienceRating).toBe("4");
    });

    test("submitting invalid form shows validation errors in DOM and does not add logs", () => {
        const form = document.getElementById("volunteer-form");

        form.elements["charityName"].value = "";
        form.elements["hoursVolunteered"].value = "";
        form.elements["date"].value = "";
        form.elements["experienceRating"].value = "";

        const fakeEvent = {
            preventDefault: jest.fn(),
            target: form
        };

        handleVolunteerFormSubmit(fakeEvent);

        const errorsContainer = document.getElementById("volunteer-errors");
        expect(errorsContainer.innerHTML).not.toBe("");

        const logs = getVolunteerLogs();
        expect(logs.length).toBe(0);
    });
});

// Stage Two: unit tests for total hours calculation
describe("calculateTotalHours", () => {
    test("sums hours correctly for valid logs", () => {
        const logs = [
            { hoursVolunteered: "2" },
            { hoursVolunteered: "3.5" },
            { hoursVolunteered: 1 }
        ];

        const total = calculateTotalHours(logs);
        expect(total).toBeCloseTo(6.5);
    });

    test("treats invalid hours as 0", () => {
        const logs = [
            { hoursVolunteered: "abc" },
            { hoursVolunteered: null },
            { hoursVolunteered: "4" }
        ];

        const total = calculateTotalHours(logs);
        expect(total).toBe(4);
    });
});

// Stage Two: integration tests for table, storage, deletion, and summary
describe("Stage Two: table, storage, deletion integration", () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="volunteer-errors"></div>
            <form id="volunteer-form">
                <input type="text" id="charity-name" name="charityName" />
                <input type="number" id="hours-volunteered" name="hoursVolunteered" />
                <input type="date" id="volunteer-date" name="date" />
                <select id="experience-rating" name="experienceRating">
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
            </form>
            <table id="volunteer-table">
                <thead>
                    <tr>
                        <th>Charity</th>
                        <th>Hours</th>
                        <th>Date</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="volunteer-table-body"></tbody>
            </table>
            <p>Total Hours Volunteered: <span id="total-hours-value">0</span></p>
        `;

        resetVolunteerLogs();
        if (typeof localStorage !== "undefined") {
            localStorage.clear();
        }
    });

    test("table and summary reflect logs loaded from localStorage", () => {
        const sampleLogs = [
            {
                id: "1",
                charityName: "Charity A",
                hoursVolunteered: "2",
                date: "2025-11-01",
                experienceRating: "3"
            },
            {
                id: "2",
                charityName: "Charity B",
                hoursVolunteered: "3.5",
                date: "2025-11-02",
                experienceRating: "4"
            }
        ];

        saveVolunteerLogsToStorage(sampleLogs);

        const loadedLogs = loadVolunteerLogsFromStorage();
        renderVolunteerTable(loadedLogs);
        renderTotalHours(loadedLogs);

        const rows = document.querySelectorAll("#volunteer-table-body tr");
        expect(rows.length).toBe(2);

        const totalElement = document.getElementById("total-hours-value");
        expect(totalElement.textContent).toBe("5.5");
    });

    test("deleting a record updates storage, table, and total hours", () => {
        const initialLogs = [
            {
                id: "a",
                charityName: "Charity A",
                hoursVolunteered: "2",
                date: "2025-11-01",
                experienceRating: "3"
            },
            {
                id: "b",
                charityName: "Charity B",
                hoursVolunteered: "3",
                date: "2025-11-02",
                experienceRating: "4"
            }
        ];

        saveVolunteerLogsToStorage(initialLogs);

        const loadedLogs = loadVolunteerLogsFromStorage();
        renderVolunteerTable(loadedLogs);
        renderTotalHours(loadedLogs);

        const rowsBefore = document.querySelectorAll("#volunteer-table-body tr");
        expect(rowsBefore.length).toBe(2);

        const deleteButtonForA = document.querySelector('button[data-log-id="a"]');
        const fakeClickEvent = { target: deleteButtonForA };

        handleVolunteerTableClick(fakeClickEvent);

        const rowsAfter = document.querySelectorAll("#volunteer-table-body tr");
        expect(rowsAfter.length).toBe(1);

        const totalElement = document.getElementById("total-hours-value");
        expect(totalElement.textContent).toBe("3");

        const remainingLogs = loadVolunteerLogsFromStorage();
        expect(remainingLogs.length).toBe(1);
        expect(remainingLogs[0].id).toBe("b");
    });
});
