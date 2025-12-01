function validateDonation(charity, amount, date) {
    if (!charity || !amount || !date) {
        return { valid: false, error: "Missing required fields" };
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        return { valid: false, error: "Invalid amount" };
    }

    return { valid: true, error: null };
}

function createDonationObject(charity, amount, date, message) {
    return {
        charity: charity,
        amount: Number(amount),
        date: date,
        message: message || ""
    };
}

if (typeof module !== "undefined") {
    module.exports = { validateDonation, createDonationObject };
}

document.getElementById("donation-form")?.addEventListener("submit", function (event) {
    event.preventDefault();

    const charity = document.getElementById("charity-name").value.trim();
    const amount = document.getElementById("donation-amount").value.trim();
    const date = document.getElementById("donation-date").value.trim();
    const message = document.getElementById("donor-message").value.trim();

    const errorMsg = document.getElementById("error-msg");

    const validation = validateDonation(charity, amount, date);

    if (!validation.valid) {
        errorMsg.textContent = validation.error;
        errorMsg.style.color = "red";
        return;
    }

    errorMsg.textContent = "";

    const donationData = createDonationObject(charity, amount, date, message);

    console.log("Temporary donation object:", donationData);

    alert("Donation successfully saved (temporary).");
});
