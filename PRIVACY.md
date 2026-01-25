# Privacy Policy - json0.dev

## Data Handling Summary

**All your JSON data stays on your device. Nothing is transmitted to external servers.**

## What We Collect

**Nothing.** This tool collects zero data about you or your JSON files.

## How Your Data is Processed

### Client-Side Only Processing
- All JSON diff computations happen entirely in your browser
- All JSONPath queries execute locally on your device
- All validation runs client-side
- No data is sent to any backend server or API

### No Data Persistence
- JSON data exists only in browser memory (RAM)
- Data is cleared when you refresh the page
- No localStorage, sessionStorage, or IndexedDB usage
- No cookies are set or read
- No clipboard history tracking

### File Handling
- Files uploaded via file picker stay in browser memory
- Pasted JSON stays in browser memory
- Exported files download directly to your computer
- No file uploads to cloud services

## External Dependencies

### Monaco Editor CDN (UI Assets Only)
The app loads the Monaco Editor (VS Code's text editor) from jsDelivr CDN:
- **URL**: `https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs`
- **What's transmitted**: Request for editor JavaScript/CSS files only
- **Your data**: NOT transmitted - only the editor UI code is fetched
- **Frequency**: One-time on first load (usually cached afterward)
- **Can be avoided**: Deploy the app self-hosted with local Monaco files

### What the CDN Sees
When loading Monaco Editor:
- Your browser type and version (User-Agent header)
- Approximate location (via IP address)
- Timestamp of request
- **Does NOT see**: Your JSON data or any file contents

## Third-Party Libraries

All dependencies process data locally:
- **json-diff-kit** (^1.0.34) - Client-side JSON comparison
- **jsonpath-plus** (^10.2.0) - Client-side JSONPath queries
- **diff** (^5.1.0) - Client-side character-level diff
- **ajv** (^8.17.1) - Client-side JSON validation
- **zustand** (^5.0.2) - Client-side state management (RAM only)
- **framer-motion** (^11.11.17) - Client-side animations

None of these libraries make network requests or transmit your data.

## Network Activity

### What Happens When You Use the App

1. **Initial Page Load**:
   - HTML, CSS, JavaScript bundles downloaded from Vercel (or your host)
   - Monaco Editor files downloaded from jsDelivr CDN (one-time)
   - Fonts loaded from Google Fonts CDN

2. **Using the Tool**:
   - **Zero** network requests for JSON processing
   - All diff/JSONPath/validation happens locally
   - No analytics or tracking

3. **Exporting Results**:
   - Files download directly to your computer
   - No upload to cloud storage

## What We Don't Do

✅ No user tracking
✅ No analytics (Google Analytics, etc.)
✅ No error tracking services (Sentry, etc.)
✅ No A/B testing
✅ No marketing pixels
✅ No session recording
✅ No IP logging
✅ No fingerprinting
✅ No data retention (because there's no data to retain)

## Safe for Sensitive Data

This tool is safe for:
- ✓ Personally Identifiable Information (PII)
- ✓ Medical records (HIPAA-compliant workflows)
- ✓ Financial data
- ✓ Proprietary algorithms
- ✓ Confidential business data
- ✓ Internal API configurations
- ✓ Secrets and credentials (though we recommend using a secrets manager)
- ✓ Air-gapped environments (after Monaco Editor is cached)

## Compliance

### GDPR (General Data Protection Regulation)
- **Compliant**: No personal data collected or processed on servers
- No need for cookie consent (no cookies used)
- No data subject access requests needed (no data stored)

### CCPA (California Consumer Privacy Act)
- **Compliant**: No data collection or sale
- No consumer data to delete or export

### HIPAA (Health Insurance Portability and Accountability Act)
- **Safe to use**: All processing is client-side
- No Protected Health Information (PHI) transmission
- Recommended: Use in secure, compliant environments

## For Security Teams

### Self-Hosting for Maximum Privacy
To avoid the Monaco Editor CDN dependency:

1. Clone the repository
2. Copy Monaco worker files to `/public/monaco-workers/`
3. Update `components/studio/MonacoEditor.tsx` to use local path:
   ```typescript
   loader.config({
     paths: { vs: '/monaco-workers/vs' }
   });
   ```
4. Deploy to your infrastructure

### Network Audit
You can verify privacy claims by:
1. Open browser DevTools → Network tab
2. Upload sensitive JSON file
3. Perform diff/JSONPath/validation operations
4. Observe: Only Monaco CDN requests (one-time), no data transmission

### Air-Gapped Deployment
After Monaco Editor is cached (first load with internet):
- App works 100% offline
- No network requests during JSON processing
- Safe for classified/air-gapped environments

## Questions or Concerns?

If you have privacy questions or find any data transmission we missed:
- Open an issue: https://github.com/darkninja001/ubiquitous-palm-tree/issues
- Review the source code: All processing logic is open and auditable

## Last Updated

January 2026

---

**TL;DR**: Your JSON never leaves your browser. Everything runs locally. The only external request is for the Monaco Editor UI code (not your data). Safe for sensitive information.
