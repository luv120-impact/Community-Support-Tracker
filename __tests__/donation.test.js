const { validateDonation, createDonationObject } = require("../js/donation.js");

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

describe("Integration Tests - Form Submission", () => {

    function setupDOM() {
        document.body.innerHTML = `
            <form id="donation-form">
                <input id="charity-name" value="Red Cross">
                <input id="donation-amount" value="100">
                <input id="donation-date" value="2024-01-01">
                <textarea id="donor-message">Thank you!</textarea>
                <button type="submit">Add Donation</button>
                <p id="error-msg"></p>
            </form>

            <table id="donation-table">
                <tbody></tbody>
            </table>

            <span id="total-donated">0</span>
        `;
    }

    test("valid form submission passes validation", () => {
        setupDOM();

        const charity = "Red Cross";
        const amount = "100";
        const date = "2024-01-01";

        const result = validateDonation(charity, amount, date);

        expect(result.valid).toBe(true);
    });

    test("invalid form submission triggers error message", () => {
        setupDOM();
        document.getElementById("donation-amount").value = "";

        const charity = document.getElementById("charity-name").value;
        const amount = document.getElementById("donation-amount").value;
        const date = document.getElementById("donation-date").value;

        const result = validateDonation(charity, amount, date);

        expect(result.valid).toBe(false);
    });
});


describe("Integration Tests - Stage Two Persistence", () => {

    function setupDOM() {
        document.body.innerHTML = `
            <table id="donation-table">
                <tbody></tbody>
            </table>
            <span id="total-donated">0</span>
        `;
    }

    test("table updates after loading data from localStorage", () => {
        setupDOM();

        localStorage.setItem("donations", JSON.stringify([
            { charity: "Red Cross", amount: 50, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(1);
    });

    test("persisted data appears in the table after reload", () => {
        setupDOM();

        localStorage.setItem("donations", JSON.stringify([
            { charity: "A", amount: 10, date: "2024-01-01", message: "" },
            { charity: "B", amount: 20, date: "2024-02-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(2);
    });
});

describe("Unit Tests - Stage Two Functions", () => {

    function setupDOM() {
        document.body.innerHTML = `
            <table id="donation-table"><tbody></tbody></table>
            <span id="total-donated">0</span>
        `;
    }

    beforeEach(() => {
        localStorage.clear();
        setupDOM();
    });

    test("calculates total donation amount correctly", () => {
        localStorage.setItem("donations", JSON.stringify([
            { amount: 10 },
            { amount: 5 },
            { amount: 20 }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const total = document.getElementById("total-donated").textContent;
        expect(total).toBe("35.00");
    });

    test("deleting a record updates localStorage", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "X", amount: 100, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const btn = document.querySelector(".delete-btn");
        btn.click();

        const saved = JSON.parse(localStorage.getItem("donations"));
        expect(saved.length).toBe(0);
    });

    test("total updates when a record is deleted", () => {
        localStorage.setItem("donations", JSON.stringify([
            { amount: 30 },
            { amount: 20 }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const btn = document.querySelector(".delete-btn");
        btn.click();

        const total = document.getElementById("total-donated").textContent;
        expect(total).toBe("20.00");
    });
});
