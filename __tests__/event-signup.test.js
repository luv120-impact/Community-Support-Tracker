/**
 * EVENT SIGNUP — STAGE TWO JEST TESTS
 */

const { JSDOM } = require("jsdom");

const {
    validateSignup,
    createSignupObject,
    saveSignups,
    loadSignups,
    renderTable,
    calculateEventSummary,
    renderEventSummary,
    deleteSignup,
    setSignupList,
    STORAGE_KEY
} = require("../js/event-signup");

describe("Event Signup – Stage Two Tests", () => {
    let dom;
    let document;
    let window;
    let localStorageMock;

    beforeEach(() => {
        dom = new JSDOM(
            `<!DOCTYPE html>
                <body>
                    <form id="signupForm">
                        <input id="name" />
                        <span id="nameError"></span>

                        <input id="email" />
                        <span id="emailError"></span>

                        <select id="event">
                            <option value="">Select</option>
                            <option value="Cleanup">Cleanup</option>
                        </select>
                        <span id="eventError"></span>

                        <p id="formFeedback"></p>
                    </form>

                    <table id="signupTable">
                        <tbody id="signupTableBody"></tbody>
                    </table>

                    <ul id="summaryList"></ul>
                </body>`
        );

        window = dom.window;
        document = window.document;


        localStorageMock = {
            store: {},
            setItem(key, value) {
                this.store[key] = value;
            },
            getItem(key) {
                return this.store[key] || null;
            },
            removeItem(key) {
                delete this.store[key];
            }
        };

        window.localStorage = localStorageMock;
    });


    test("validateSignup fails if name is empty", () => {
        const data = { name: "", email: "test@test.com", event: "Cleanup" };
        const result = validateSignup(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe("Name is required.");
    });

    test("validateSignup fails if email is empty", () => {
        const data = { name: "Taran", email: "", event: "Cleanup" };
        const result = validateSignup(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBe("Email is required.");
    });

    test("validateSignup fails on invalid email", () => {
        const data = { name: "Taran", email: "wrong", event: "Cleanup" };
        const result = validateSignup(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.email).toBe("Enter a valid email.");
    });

    test("validateSignup fails if event not selected", () => {
        const data = { name: "Taran", email: "ok@test.com", event: "" };
        const result = validateSignup(data);

        expect(result.isValid).toBe(false);
        expect(result.errors.event).toBe("Please select an event.");
    });

    test("validateSignup passes for valid data", () => {
        const data = { name: "Taran", email: "ok@test.com", event: "Cleanup" };
        const result = validateSignup(data);

        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
    });

    test("saveSignups stores data in localStorage", () => {
        const list = [{ name: "A", email: "a@a.com", event: "Cleanup" }];
        saveSignups(localStorageMock, list);

        expect(localStorageMock.store[STORAGE_KEY]).toBe(JSON.stringify(list));
    });

    test("loadSignups returns saved list", () => {
        const list = [{ name: "A", email: "a@a.com", event: "Cleanup" }];
        localStorageMock.setItem(STORAGE_KEY, JSON.stringify(list));

        const loaded = loadSignups(localStorageMock);
        expect(loaded).toEqual(list);
    });

    test("loadSignups returns empty array if storage empty", () => {
        const loaded = loadSignups(localStorageMock);
        expect(loaded).toEqual([]);
    });



    test("renderTable adds rows to table", () => {
        const list = [
            { id: "1", name: "A", email: "a@a.com", event: "Cleanup" }
        ];

        renderTable(document, list);

        const rows = document.querySelectorAll("#signupTableBody tr");
        expect(rows.length).toBe(1);
        expect(rows[0].children[0].textContent).toBe("A");
    });


    test("calculateEventSummary counts events correctly", () => {
        const list = [
            { event: "Cleanup" },
            { event: "Cleanup" },
            { event: "Fundraiser" }
        ];

        const summary = calculateEventSummary(list);

        expect(summary).toEqual({
            Cleanup: 2,
            Fundraiser: 1
        });
    });

    test("renderEventSummary updates DOM", () => {
        const list = [
            { event: "Cleanup" },
            { event: "Cleanup" }
        ];

        renderEventSummary(document, list);

        const items = document.querySelectorAll("#summaryList li");
        expect(items.length).toBe(1);
        expect(items[0].textContent).toBe("Cleanup: 2 signup(s)");
    });


    test("deleteSignup removes record and updates DOM", () => {
        const list = [
            { id: "1", name: "A", email: "a@a.com", event: "Cleanup" },
            { id: "2", name: "B", email: "b@b.com", event: "Cleanup" }
        ];

        setSignupList(list);

        saveSignups(localStorageMock, list);
        renderTable(document, list);
        renderEventSummary(document, list);

        deleteSignup("1", document, localStorageMock);

        const rows = document.querySelectorAll("#signupTableBody tr");
        expect(rows.length).toBe(1);
        expect(rows[0].getAttribute("data-id")).toBe("2");
    });
});
