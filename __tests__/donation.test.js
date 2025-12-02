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
