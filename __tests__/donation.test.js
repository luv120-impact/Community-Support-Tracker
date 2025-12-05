/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Stage Two Donation Tests", () => {
    let donationScript;

    beforeEach(() => {
        document.body.innerHTML = `
            <table id="donation-table">
                <tbody></tbody>
            </table>

            <div id="total-donated">0.00</div>

            <form id="donation-form">
                <input id="charity-name" />
                <input id="donation-amount" />
                <input id="donation-date" />
                <textarea id="donor-message"></textarea>
            </form>
        `;

        localStorage.clear();

        const filePath = path.resolve(__dirname, "../js/donation.js");
        const scriptContent = fs.readFileSync(filePath, "utf8");
        eval(scriptContent);
    });

    test("table updates after loading data from localStorage", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "Red Cross", amount: 15, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(1);
    });

    test("persisted data appears in the table after reload", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "A", amount: 10, date: "2024-01-01", message: "" },
            { charity: "B", amount: 20, date: "2024-01-02", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(2);
    });

    test("calculates total donation amount correctly", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "A", amount: 10, date: "2024-01-01", message: "" },
            { charity: "B", amount: 25, date: "2024-01-02", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const total = document.getElementById("total-donated").textContent;
        expect(total).toBe("35.00");
    });

    test("deleting a record updates localStorage", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "Test", amount: 10, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const btn = document.querySelector(".delete-btn");
        btn.click();

        const saved = JSON.parse(localStorage.getItem("donations"));
        expect(saved.length).toBe(0);
    });

    test("total updates when a record is deleted", () => {
        localStorage.setItem("donations", JSON.stringify([
            { charity: "A", amount: 10, date: "2024-01-01", message: "" }
        ]));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        const btn = document.querySelector(".delete-btn");
        btn.click();

        const total = document.getElementById("total-donated").textContent;
        expect(total).toBe("0.00");
    });
});
