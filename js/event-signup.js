// ===========================
// EVENT SIGNUP – STAGE TWO JS
// ===========================

const STORAGE_KEY = "eventSignups";
let signupList = [];

// ---------------------------
// 1. READ FORM VALUES
// ---------------------------

function getFormValues(document) {
    return {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        event: document.getElementById("event").value.trim()
    };
}

// ---------------------------
// 2. VALIDATION
// ---------------------------

function validateSignup(data) {
    const errors = {};

    if (!data.name) {
        errors.name = "Name is required.";
    }

    if (!data.email) {
        errors.email = "Email is required.";
    } else {
        const emailPattern = /^\S+@\S+\.\S+$/;
        if (!emailPattern.test(data.email)) {
            errors.email = "Enter a valid email.";
        }
    }

    if (!data.event) {
        errors.event = "Please select an event.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// ---------------------------
// 3. DISPLAY ERROR MESSAGES
// ---------------------------

function showErrors(document, errors) {
    document.getElementById("nameError").innerText = errors.name || "";
    document.getElementById("emailError").innerText = errors.email || "";
    document.getElementById("eventError").innerText = errors.event || "";

    document.getElementById("formFeedback").innerText =
        "Fix the errors above.";
}

// Clear previous errors
function clearErrors(document) {
    document.getElementById("nameError").innerText = "";
    document.getElementById("emailError").innerText = "";
    document.getElementById("eventError").innerText = "";
    document.getElementById("formFeedback").innerText = "";
}

// ---------------------------
// 4. CREATE SIGNUP OBJECT
// ---------------------------

function createSignupObject(data) {
    return {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        event: data.event
    };
}

// helper for tests so they can control signupList
function setSignupList(list) {
    signupList = list;
}

// ---------------------------
// 5. LOCAL STORAGE FUNCTIONS
// ---------------------------

function saveSignups(storage, list) {
    storage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadSignups(storage) {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// ---------------------------
// 6. RENDER TABLE
// ---------------------------

function renderTable(document, list) {
    const tbody = document.getElementById("signupTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    list.forEach((signup) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", signup.id);

        tr.innerHTML = `
            <td>${signup.name}</td>
            <td>${signup.email}</td>
            <td>${signup.event}</td>
            <td><button class="delete-btn" data-id="${signup.id}">Delete</button></td>
        `;

        tbody.appendChild(tr);
    });
}

// ---------------------------
// 7. EVENT SUMMARY
// ---------------------------

function calculateEventSummary(list) {
    const summary = {};
    list.forEach((s) => {
        if (!summary[s.event]) summary[s.event] = 0;
        summary[s.event]++;
    });
    return summary;
}

function renderEventSummary(document, list) {
    const ul = document.getElementById("summaryList");
    if (!ul) return;

    ul.innerHTML = "";

    const summary = calculateEventSummary(list);

    if (Object.keys(summary).length === 0) {
        ul.innerHTML = "<li>No signups yet.</li>";
        return;
    }

    Object.keys(summary).forEach((eventName) => {
        const li = document.createElement("li");
        li.textContent = `${eventName}: ${summary[eventName]} signup(s)`;
        ul.appendChild(li);
    });
}

// ---------------------------
// 8. DELETE SIGNUP
// ---------------------------

function deleteSignup(id, document, storage) {
    signupList = signupList.filter((s) => s.id !== id);
    saveSignups(storage, signupList);
    renderTable(document, signupList);
    renderEventSummary(document, signupList);
}

// ---------------------------
// 9. FORM SUBMIT HANDLER
// ---------------------------

function onFormSubmit(event) {
    event.preventDefault();
    clearErrors(document);

    const data = getFormValues(document);
    const result = validateSignup(data);

    if (!result.isValid) {
        showErrors(document, result.errors);
        return;
    }

    const signup = createSignupObject(data);
    signupList.push(signup);

    saveSignups(window.localStorage, signupList);
    renderTable(document, signupList);
    renderEventSummary(document, signupList);

    document.getElementById("signupForm").reset();
    document.getElementById("formFeedback").innerText = "Signup added!";
}

// ---------------------------
// 10. INITIALIZE PAGE
// ---------------------------

function initEventSignupPage(windowObj) {
    const doc = windowObj.document;

    signupList = loadSignups(windowObj.localStorage);

    renderTable(doc, signupList);
    renderEventSummary(doc, signupList);

    const form = doc.getElementById("signupForm");
    if (form) {
        form.addEventListener("submit", onFormSubmit);
    }

    const table = doc.getElementById("signupTable");
    if (table) {
        table.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-btn")) {
                const id = e.target.getAttribute("data-id");
                deleteSignup(id, doc, windowObj.localStorage);
            }
        });
    }
}

// Auto-run in browser
if (typeof window !== "undefined") {
    window.onload = () => initEventSignupPage(window);
} else {
    // Export for Jest tests
    module.exports = {
        getFormValues,
        validateSignup,
        createSignupObject,
        saveSignups,
        loadSignups,
        renderTable,
        calculateEventSummary,
        renderEventSummary,
        deleteSignup,
        setSignupList,
        onFormSubmit,
        initEventSignupPage,
        STORAGE_KEY
    };
}