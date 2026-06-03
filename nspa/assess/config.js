// ============================================================
//  NSPA AI Pulse — Configuration
// ============================================================
//  Paste your Google Apps Script Web App URL between the quotes
//  below. See README.md, Step 3, for how to get this URL.
//
//  If you leave it as "" the site still works fully in DEMO MODE:
//  it generates a sample cloud of providers so you can preview
//  the chart and your results. Nothing is saved in demo mode.
// ============================================================

const NSPA_CONFIG = {
  // Example: "https://script.google.com/macros/s/AKfy.....abc/exec"
  SHEET_ENDPOINT: "",

  // Cosmetic only: how many simulated peers to show if there is
  // no saved data yet (or while running in demo mode).
  SEED_PEERS: 60
};
