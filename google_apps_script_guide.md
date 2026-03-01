# Google Apps Script Setup Guide
## Connect Orbital Contact Form → Google Sheets

This is a one-time setup that takes ~5 minutes. Sign in as `orbitalt.customercare@gmail.com`.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet: **Orbital Contact Form Responses**
3. Add these headers in Row 1 (exactly as shown):

| A | B | C | D | E |
|---|---|---|---|---|
| Timestamp | Full Name | Phone Number | Email | Message |

---

## Step 2 — Open Apps Script

1. In the sheet: **Extensions → Apps Script**
2. Delete existing code, paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.fullName  || '',
      data.phone     || '',
      data.email     || '',
      data.message   || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this manually to test your sheet connection
function testConnection() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow(['TEST', 'Test Name', '9876543210', 'test@example.com', 'Test message']);
  Logger.log('Test row added successfully.');
}
```

3. Save (Ctrl+S), name the project: **Orbital Contact Form**

---

## Step 3 — Deploy as Web App

1. **Deploy → New Deployment**
2. Click ⚙️ gear → **Web app**
3. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** → authorize if prompted
5. **Copy the Web App URL** (looks like `https://script.google.com/macros/s/AKfyc.../exec`)

---

## Step 4 — Paste URL into script.js

Find this line in `script.js` (around line 783):

```javascript
const APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace with your URL:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec';
```

---

## Step 5 — Test

Submit the form → check your Google Sheet → new row should appear with IST timestamp + all form data.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| No data in sheet | Verify the URL in `script.js` is correct |
| Authorization error | Set "Who has access" to **Anyone** |
| Changes not taking effect | Re-deploy as **New Version** (Deploy → Manage Deployments → Edit) |

> **Note:** The form uses `mode: 'no-cors'` because Google Apps Script doesn't send CORS headers. The data still reaches the sheet fine — we just can't read the response.
