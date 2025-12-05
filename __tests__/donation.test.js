const { validateDonation, createDonationObject } = require("../js/donation.js");

beforeEach(() => {
    localStorage.clear();
    setupDOM();
});

function setupDOM() {
    document.body.innerHTML = `
        <form id="donation-form">
            <input id="charity-name" />
            <input id="donation-amount" />
            <input id="donation-date" />
            <textarea id="donor-message"></textarea>
            <button type="submit">Add Donation</button>
            <p id="error-msg"></p>
        </form>

        <table id="donation-table">
            <tbody></tbody>
        </table>

        <p>Total: $<span id="total-donated">0</span></p>
    `;
}

describe("Unit Tests - Validation", () => {

    test("detects missing required fields", () => {
        const result = validateDonation("", "50", "2024-01-01");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Missing required fields");
    });

    test("detects invalid donation amount", () => {
        const result = validateDonation("Charity", "abc", "2024-01-01");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Invalid amount");
    });

    test("accepts valid input", () => {
        const result = validateDonation("Charity", "50", "2024-01-01");
        expect(result.valid).toBe(true);
    });
});

describe("Unit Tests - Temporary Donation Object", () => {

    test("creates correct donation object", () => {
        const obj = createDonationObject("Charity", "50", "2024-01-01", "Message");

        expect(obj).toEqual({
            charity: "Charity",
            amount: 50,
            date: "2024-01-01",
            message: "Message"
        });
    });
});

describe("Integration Tests - Stage Two Persistence", () => {

    test("table updates after loading data from localStorage", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "Red Cross", amount: 20, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(1);
    });

    test("persisted data appears in the table after reload", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "Red Cross", amount: 20, date: "2024-01-01", message: "" },
            { charity: "UNICEF", amount: 15, date: "2024-01-02", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(2);
    });
});

describe("Unit Tests - Stage Two Functions", () => {

    test("calculates total donation amount correctly", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "One", amount: 15, date: "2024-01-01", message: "" },
            { charity: "Two", amount: 20, date: "2024-01-02", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const total = document.getElementById("total-donated").textContent;
        expect(total).toBe("35.00");
    });

    test("deleting a record updates localStorage", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "DeleteMe", amount: 20, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const btn = document.querySelector(".delete-btn");
        btn.click();

        const saved = JSON.parse(localStorage.getItem("donations"));
        expect(saved.length).toBe(0);
    });

    test("total updates when a record is deleted", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "A", amount: 20, date: "2024-01-01", message: "" },
            { charity: "B", amount: 15, date: "2024-01-02", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const btn = document.querySelector(".delete-btn");
        btn.click();

        const total = document.getElementById("total-donated").textContent;
        expect(total).toBe("15.00");
    });
});
