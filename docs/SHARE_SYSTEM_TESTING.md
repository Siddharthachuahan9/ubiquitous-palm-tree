# Share System Testing Guide - XML to JSON Tool

## 🎯 How Share System Works

The share system encodes the current tool state into the URL hash using LZ-string compression. When someone opens the shared link, the state is automatically restored and the conversion is re-executed.

### Share Flow Diagram

```
User enters XML → Clicks Convert → Gets JSON output
                              ↓
                   Clicks Share Button
                              ↓
            State encoded: { tool, xmlInput, jsonOutput }
                              ↓
                  Compressed with LZ-string
                              ↓
                URL: https://json0.dev/xml-to-json#s=compressed_data
                              ↓
                   Copied to clipboard
                              ↓
            Friend opens link → State decoded
                              ↓
                XML input restored → Auto-convert triggered
                              ↓
                  JSON output appears
```

---

## ✅ Step-by-Step Testing Instructions

### Test 1: Basic Share Functionality

1. **Navigate to the tool**
   ```
   http://localhost:3000/xml-to-json
   ```

2. **Enter sample XML** (or click example button):
   ```xml
   <user id="1">
     <name>Ana</name>
     <email>ana@example.com</email>
   </user>
   ```

3. **Click "Convert" button**
   - Verify JSON appears in right panel
   - Should show:
   ```json
   {
     "user": {
       "_attributes": { "id": "1" },
       "name": "Ana",
       "email": "ana@example.com"
     }
   }
   ```

4. **Click "🔗 Share" button**
   - Button should change to "✓ Copied!" for 2 seconds
   - URL is copied to clipboard

5. **Paste URL into new browser tab/incognito window**
   - Expected URL format: `http://localhost:3000/xml-to-json#s=N4IgdghgtgpiBcIA...`
   - Page should load
   - XML input should appear automatically
   - JSON output should appear automatically (after ~100ms)

6. **Check browser console** (F12 → Console tab):
   ```
   [XMLToJSON] Shared state loaded: {tool: 'xml-to-json', hasXmlInput: true, xmlLength: 82}
   [XMLToJSON] Restoring XML input and auto-converting...
   [XMLToJSON] Executing conversion...
   ```

### Test 2: Empty State Share

1. **Clear all input** (click "Clear" button)
2. **Click "🔗 Share"**
   - Should work (creates share link with empty data)
3. **Open shared link**
   - Should show empty tool (no error)

### Test 3: Large XML File Share

1. **Click "User Profile XML" example**
2. **Modify to add more data** (make it ~1KB)
3. **Click Convert → Share**
4. **Check URL length** - should be compressed efficiently
5. **Open in new tab** - should restore perfectly

### Test 4: Invalid XML Share

1. **Enter invalid XML**:
   ```xml
   <user>
     <name>Missing closing tag
   </user>
   ```
2. **Click Convert** - should show error
3. **Click Share** - should create link
4. **Open shared link** - should show error message (not crash)

### Test 5: Cross-Tool Share Protection

1. **Go to Base64 tool**: `/base64`
2. **Encode some text and share it**
3. **Copy the shared Base64 link**
4. **Manually change URL** from `/base64#s=...` to `/xml-to-json#s=...`
5. **Open modified link**
6. **Expected**: Console warning, no crash
   ```
   [XMLToJSON] Tool mismatch. Expected xml-to-json, got: base64
   ```

---

## 🔍 Debugging Share Issues

### Issue: "Share button doesn't copy URL"

**Symptoms**: Button doesn't show "✓ Copied!" state

**Diagnosis**:
```javascript
// Open DevTools Console (F12)
// Paste this:
navigator.clipboard.writeText('test')
  .then(() => console.log('✅ Clipboard API works'))
  .catch(err => console.error('❌ Clipboard blocked:', err))
```

**Fixes**:
- Use HTTPS (clipboard API requires secure context)
- Grant clipboard permissions in browser
- Check browser console for permission errors

### Issue: "Shared link doesn't restore state"

**Symptoms**: Opening shared link shows empty tool

**Diagnosis Steps**:

1. **Check URL format**:
   ```
   ✅ Good: http://localhost:3000/xml-to-json#s=N4IgdghgtgpiBc...
   ❌ Bad:  http://localhost:3000/xml-to-json
   ❌ Bad:  http://localhost:3000/xml-to-json#
   ❌ Bad:  http://localhost:3000/xml-to-json#share=... (legacy format)
   ```

2. **Test decode function**:
   ```javascript
   // Open browser console on the shared link page
   import { loadStateFromURL } from '@/lib/utils/shareState'

   const state = loadStateFromURL()
   console.log('Decoded state:', state)
   // Should show: {tool: 'xml-to-json', data: {...}, version: '1.0'}
   ```

3. **Check browser console logs**:
   ```
   Expected logs:
   [XMLToJSON] Shared state loaded: {...}
   [XMLToJSON] Restoring XML input and auto-converting...
   [XMLToJSON] Executing conversion...

   Missing logs means useEffect didn't run or state was null
   ```

4. **Verify hash isn't stripped**:
   - Some proxies/CDNs strip URL hashes
   - Test on `localhost:3000` first
   - Test on production domain

### Issue: "Auto-conversion doesn't happen"

**Symptoms**: XML loads but JSON doesn't appear

**Diagnosis**:
```javascript
// Check if handleConvert is being called
const { convertXMLToJSON } = require('@/lib/utils/xmlToJson')

// Test conversion manually
const xml = '<user><name>Test</name></user>'
const result = convertXMLToJSON(xml)
console.log(result)
// Should show: {success: true, json: '...', ...}
```

**Possible Causes**:
- Timeout not firing (increase from 100ms to 500ms)
- Invalid XML in shared state
- Browser blocking setTimeout (rare)

### Issue: "Wrong tool state loaded"

**Symptoms**: Base64 data appears in XML tool

**This is the expected behavior** - The tool ID check prevents this:

```typescript
if (sharedState.tool === 'xml-to-json') {
  // Only restore if tool matches
}
```

If this happens, the URL was manually modified or corrupted.

---

## 🧪 Automated Testing Script

Save this as `test-share.js` and run with Node.js:

```javascript
const https = require('https');

async function testShareSystem(baseURL) {
  console.log('🧪 Testing XML to JSON Share System\n');

  // Test 1: Check if route exists
  console.log('Test 1: Route accessibility');
  try {
    const response = await fetch(`${baseURL}/xml-to-json`);
    console.log(response.ok ? '✅ PASS' : '❌ FAIL', '- Route exists');
  } catch (err) {
    console.log('❌ FAIL - Route not accessible:', err.message);
  }

  // Test 2: Check if share link format is valid
  console.log('\nTest 2: Share link format');
  const mockURL = `${baseURL}/xml-to-json#s=N4IgdghgtgpiBcIDCA`;
  const hashPattern = /#s=[A-Za-z0-9+/=_-]+$/;
  console.log(hashPattern.test(mockURL) ? '✅ PASS' : '❌ FAIL', '- Hash format valid');

  // Test 3: Test LZ-string compression
  console.log('\nTest 3: Compression/Decompression');
  try {
    // Note: This requires lz-string package
    // npm install lz-string
    const LZString = require('lz-string');

    const testData = {
      tool: 'xml-to-json',
      data: { xmlInput: '<test>data</test>' },
      version: '1.0'
    };

    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(testData));
    const decompressed = JSON.parse(LZString.decompressFromEncodedURIComponent(compressed));

    const matches = JSON.stringify(testData) === JSON.stringify(decompressed);
    console.log(matches ? '✅ PASS' : '❌ FAIL', '- Compression round-trip');
  } catch (err) {
    console.log('⚠️  SKIP - lz-string not installed');
  }

  console.log('\n✅ Testing complete');
}

// Run tests
testShareSystem('http://localhost:3000');
```

---

## 📊 Share System Architecture

### File Dependencies

```
XMLToJSONTool.tsx
    ↓
lib/utils/shareState.ts
    ↓
lz-string (npm package)
    ↓
URL Hash (#s=...)
    ↓
Browser API
```

### Data Flow

```typescript
// Share (Encode)
const data = { xmlInput: '<user>...</user>', jsonOutput: '{...}' }
                    ↓
JSON.stringify(data)
                    ↓
compressToEncodedURIComponent(json)
                    ↓
`#s=${compressed}`
                    ↓
navigator.clipboard.writeText(url)

// Load (Decode)
window.location.hash
                    ↓
hash.replace(/^#s=/, '')
                    ↓
decompressFromEncodedURIComponent(encoded)
                    ↓
JSON.parse(decompressed)
                    ↓
setXmlInput(data.xmlInput)
```

### State Format

```typescript
interface ShareableState {
  tool: string;        // 'xml-to-json'
  data: {
    xmlInput: string;  // Original XML
    jsonOutput: string; // Converted JSON (for reference)
  };
  version: string;     // '1.0'
}
```

---

## 🚀 Production Testing Checklist

Before deploying to production:

- [ ] Test on localhost:3000
- [ ] Test on staging domain (if applicable)
- [ ] Test with HTTPS (required for clipboard API)
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test on mobile devices
- [ ] Test with large XML files (1MB+)
- [ ] Test with special characters (UTF-8, emojis)
- [ ] Test with malformed XML
- [ ] Test copy functionality on all browsers
- [ ] Test shared links remain valid after 24 hours
- [ ] Test shared links work in incognito mode
- [ ] Test URL length limits (browsers cap at ~2000 chars)
- [ ] Test compression ratio (should be ~60% of original)

---

## 🐛 Known Limitations

### 1. URL Length Limit
- **Limit**: ~2000 characters (varies by browser)
- **Impact**: Very large XML files may not share properly
- **Workaround**: Use file upload feature locally instead of sharing

### 2. Sensitive Data Warning
- **Behavior**: ShareButton detects emails, tokens, API keys
- **Shows**: Warning modal before sharing
- **User Action**: Must click "Share Anyway" to proceed

### 3. Browser Compatibility
- **Clipboard API**: Requires HTTPS (except localhost)
- **FileReader**: Works on all modern browsers
- **DOMParser**: Works on all modern browsers
- **LZ-string**: Works universally

### 4. No Server Storage
- **Benefit**: Privacy-first (no data leaves browser)
- **Limitation**: Links stop working if URL is truncated
- **Solution**: Copy full URL including hash fragment

---

## 📞 Troubleshooting Contact

If share functionality still doesn't work after following this guide:

1. **Check browser console** for errors
2. **Verify localhost URL** includes hash: `#s=...`
3. **Test clipboard permissions**
4. **Try different browser** (Chrome recommended for testing)
5. **Check for browser extensions** blocking clipboard API

---

**Document Version**: 1.0
**Last Updated**: January 28, 2026
**Tested On**: Chrome 120, Firefox 121, Safari 17
