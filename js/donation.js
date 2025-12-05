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

document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "donations";
    const form = document.getElementById("donation-form");
    const tableBody = document.querySelector("#donation-table tbody");
    const totalAmountDisplay = document.getElementById("total-donated");

    loadDonations();

    form?.addEventListener("submit", function (event) {
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

        saveDonation(donationData);
        addDonationToTable(donationData);
        updateTotal();

        alert("Donation successfully saved.");
        event.target.reset();
    });

    function loadDonations() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        saved.forEach(d => addDonationToTable(d));
        updateTotal();
    }

    function saveDonation(donation) {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        saved.push(donation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }

    function addDonationToTable(donation) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${donation.charity}</td>
            <td>$${donation.amount.toFixed(2)}</td>
            <td>${donation.date}</td>
            <td>${donation.message}</td>
            <td><button class="delete-btn">Delete</button></td>
        `;

        row.querySelector(".delete-btn").addEventListener("click", function () {
            deleteDonation(donation);
            row.remove();
            updateTotal();
        });

        tableBody.appendChild(row);
    }

    function deleteDonation(target) {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        const updated = saved.filter(d =>
            !(d.charity === target.charity &&
              d.amount === target.amount &&
              d.date === target.date &&
              d.message === target.message)
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    function updateTotal() {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const total = saved.reduce((sum, d) => sum + d.amount, 0);
        totalAmountDisplay.textContent = total.toFixed(2);
    }
});
