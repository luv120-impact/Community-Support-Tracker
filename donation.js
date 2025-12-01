document.getElementById("donation-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const charityName = document.getElementById("charity-name").value.trim();
    const donationAmount = document.getElementById("donation-amount").value.trim();
    const donationDate = document.getElementById("donation-date").value.trim();
    const donorMessage = document.getElementById("donor-message").value.trim();

    if (!charityName || !donationAmount || !donationDate) {
        alert("Please fill out all required fields.");
        return;
    }

    if (isNaN(donationAmount) || Number(donationAmount) <= 0) {
        alert("Please enter a valid donation amount.");
        return;
    }

    const donationData = {
        charity: charityName,
        amount: Number(donationAmount),
        date: donationDate,
        message: donorMessage
    };

    console.log("Donation Data Saved Temporarily:", donationData);

    alert("Donation saved (temporary). More features coming in Stage Two!");
});
