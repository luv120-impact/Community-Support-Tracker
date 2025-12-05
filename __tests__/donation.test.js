const {
    validateDonation,
    createDonationObject,
    loadDonations,
    updateTotal,
    deleteDonation
} = require("../js/donation.js");

describe("Donation Stage Two Tests", () => {

    beforeEach(() => {
        localStorage.clear();

        document.body.innerHTML = `
            <table id="donation-table">
                <tbody></tbody>
            </table>
            <p id="total-donated"></p>
        `;
    });

    test("persisted donations appear in the table", () => {
        const sample = [
            { charity: "A", amount: 10, date: "2024-01-01", message: "" },
            { charity: "B", amount: 20, date: "2024-01-02", message: "" }
        ];

        localStorage.setItem("donations", JSON.stringify(sample));

        loadDonations();

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(2);
    });

    test("total donation calculation works", () => {
        const sample = [
            { charity: "A", amount: 10, date: "2024-01-01", message: "" },
            { charity: "B", amount: 20, date: "2024-01-02", message: "" }
        ];

        localStorage.setItem("donations", JSON.stringify(sample));

        loadDonations();

        expect(document.getElementById("total-donated").textContent).toBe("30.00");
    });

    test("deleting a record updates storage and table", () => {
        const sample = [
            { charity: "A", amount: 10, date: "2024-01-01", message: "" },
            { charity: "B", amount: 20, date: "2024-01-02", message: "" }
        ];

        localStorage.setItem("donations", JSON.stringify(sample));

        loadDonations();

        deleteDonation(sample[0]);

        loadDonations();
        updateTotal();

        const rows = document.querySelectorAll("#donation-table tbody tr");
        expect(rows.length).toBe(1);

        expect(document.getElementById("total-donated").textContent).toBe("20.00");
    });
});
