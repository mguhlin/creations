# Water Company Work Manager

This is a simple browser-based work-order manager for a small water company with about 320 customers.

## What it handles

- Create work orders by customer, account number, phone, and service address.
- Track the problem/request, work type, priority, assigned person, status, due date, and completed date.
- Add action notes so staff can record what was done.
- Filter by status and priority.
- Search customers, notes, account numbers, addresses, and requests.
- Mark work orders complete.
- Export CSV for Google Sheets.
- Backup and restore JSON data.

## How to open it

Open `index.html` in a browser.

## Recommended shared setup

For one person at a time, this app works locally in the browser.

For multiple people using the same work-order list, do this:

1. Create a Google Drive folder named `Work Orders`.
2. Share only that folder with the people who need access.
3. Keep `index.html`, `styles.css`, `app.js`, and exported backups in that folder.
4. Use `Export CSV` when you want to move the work orders into Google Sheets.

Important: sharing a Google Drive folder does not share everyone's computer. It only gives access to the files inside that specific folder.

## Best long-term option

If multiple staff need to edit at the same time every day, use Google Sheets, Airtable, Smartsheet, Monday.com, or a small database-backed web app. A shared Google Sheet is probably the easiest first step because staff can all edit the same work-order table live, leave notes, filter, and see completion status without installing software.

Suggested Google Sheet columns:

- Work order ID
- Date created
- Customer name
- Account number
- Phone
- Service address
- Work type
- Problem/request
- Priority
- Assigned to
- Status
- Action notes
- Due date
- Completed date
- Last updated by

## Data note

This version stores data in the browser's local storage. Use `Backup JSON` regularly if you rely on it for real work.
