/**
 * @jest-environment jsdom
 */

/**
 * Jest tests for Student 2 - Volunteer Hours Tracker (Stage One)
 */

const {
    validateVolunteerData,
    buildVolunteerLogFromForm,
    handleVolunteerFormSubmit,
    getVolunteerLogs
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
    test("builds a correct data object from form elements", () => {
        // Set up a fake DOM form
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

describe("Integration: form submission and DOM errors (Stage One)", () => {
    beforeEach(() => {
        // Reset DOM and internal data before each test
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
        // Clear any previous in-memory logs by re-requiring module if needed
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
        expect(logs.length).toBeGreaterThan(0);

        const lastLog = logs[logs.length - 1];
        expect(lastLog.charityName).toBe("Library Volunteer Program");
        expect(lastLog.hoursVolunteered).toBe("2.5");
        expect(lastLog.date).toBe("2025-11-10");
        expect(lastLog.experienceRating).toBe("4");
    });

    test("submitting invalid form shows validation errors in DOM", () => {
        const form = document.getElementById("volunteer-form");

        // Leave everything blank to trigger validation errors
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

        // Ensure no new log was added
        const logs = getVolunteerLogs();
        expect(logs.length).toBe(0);
    });
});
