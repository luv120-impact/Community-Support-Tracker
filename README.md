# Community-Support-Tracker
PiXELL River Financial is committed to supporting the communities in which we live and work. The Community Support Tracker is a web-based tool designed to monitor and manage our donation activities, employee volunteer efforts, and event participation.

This project is developed collaboratively by three team members, each responsible for one major component:

Student 1 – Donation Trackers
Student 2 – Volunteer Hours Tracker
Student 3 – Event Signup

1. Donation Tracker

Tracks all charitable donations made by PiXELL River Financial.
Features:
Form to enter charity name, donation amount, date, and optional message
Validation for required fields and numeric values
Temporary data storage and later persistent storage using localStorage
Donation table with delete functionality
Summary section showing total donated amount
Jest unit and integration tests for validation, data processing, and DOM updates

2. Volunteer Hours Tracker

Logs employee volunteer hours and summarizes company volunteer work.
Features:
Form to submit charity name, hours volunteered, date, and experience rating
Validation for empty fields and proper numeric ranges
Persistent storage via localStorage
Table displaying volunteer records with delete functionality
Summary showing total volunteer hours
Jest tests for validation, data updates, and total hour calculations

3. Event Signup Component

Registers company participation in community events.
Features:
Form to collect event name, representative name, representative email, and role
Email validation and required-field validation
Temporary data storage + integration into full system
Jest tests for validation and data object creation