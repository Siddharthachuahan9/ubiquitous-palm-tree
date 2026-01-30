# Performance Fixes for Large JSON Files

## Problem
The application was freezing/breaking when parsing JSON files around 8,000 lines due to several performance bottlenecks.

## Root Causes Identified

1. **Monaco Editor - Format on Paste/Type**
   - `formatOnPaste: true` was formatting entire 8k+ line documents synchronously on paste
   - `formatOnType: true` was formatting on every keystroke, causing severe lag
   - These operations were the primary cause of freezing

2. **Monaco Editor - Missing Performance Settings**
   - No `maxTokenizationLineLength` limit (syntax highlighting all lines)
   - Bracket pair colorization enabled for all file sizes (expensive for large files)
   - Quick suggestions without delay causing constant re-computation

3. **No Debouncing on Editor Changes**
   - Every keystroke triggered immediate state updates
   - onChange handlers fired synchronously without throttling

4. **Expensive Validation**
   - `performStructuralLinting()` recursively traversed entire JSON tree
   - For 8k line files, this meant thousands of recursive calls
   - Depth and node count calculations on every validation

## Solutions Implemented

### 1. Monaco Editor Performance Mode (`MonacoEditor.tsx`)

**Large File Detection:**
```typescript
const isLargeFile = value.split('\n').length > 1000 || value.length > 50000;
```

**Optimizations Applied for Large Files:**
- ✅ **Disabled formatOnPaste** - No more formatting 8k lines on paste
- ✅ **Disabled formatOnType** - No formatting on keystroke
- ✅ **Disabled bracket pair colorization** - Expensive for large files
- ✅ **Disabled quick suggestions** - Reduces CPU usage
- ✅ **Set maxTokenizationLineLength to 500** - Limits syntax highlighting per line
- ✅ **Increased quickSuggestionsDelay to 500ms** - Throttles suggestion computation
- ✅ **Disabled automatic indentation detection** - Skips expensive detection
- ✅ **Simplified cursor animations** - Solid cursor instead of smooth blinking
- ✅ **Disabled JSON validation** - Monaco's built-in validation skipped for large files

### 2. Debounced Editor Changes (`MonacoEditor.tsx`)

**Implemented Smart Debouncing:**
```typescript
// Large files: 300ms debounce
// Small files: No debounce (instant response)
const debounceDelay = isLargeFile ? 300 : 0;
```

This prevents state updates on every keystroke for large files while maintaining instant feedback for small files.

### 3. Optimized Validation (`validator.ts`)

**Large File Detection:**
```typescript
const isLargeFile = lineCount > 5000 || fileSize > 500_000;
```

**Skipped Expensive Operations for Large Files:**
- ✅ **Structural linting disabled** - Recursive traversal skipped
- ✅ **Depth calculation disabled** - Saves recursive processing
- ✅ **Node count disabled** - Saves tree traversal
- ✅ **Informative message added** - Users know why some checks are skipped

## Performance Thresholds

| Feature | Small File | Large File |
|---------|-----------|------------|
| **Editor Detection** | <1000 lines & <50KB | ≥1000 lines or ≥50KB |
| **Validation Detection** | <5000 lines & <500KB | ≥5000 lines or ≥500KB |
| **Format on Paste/Type** | Enabled | Disabled |
| **Bracket Colorization** | Enabled | Disabled |
| **Quick Suggestions** | Enabled (10ms delay) | Disabled (500ms delay) |
| **Max Token Length** | 20,000 chars | 500 chars |
| **Structural Linting** | Enabled | Disabled |
| **Debouncing** | 0ms (instant) | 300ms |

## Expected Performance Improvements

### Before Fix
- ❌ Freezing on paste of large JSON (8k+ lines)
- ❌ Lag on every keystroke
- ❌ Browser unresponsive during formatting
- ❌ Slow validation taking 5-10 seconds

### After Fix
- ✅ Smooth paste of large JSON files
- ✅ Responsive typing even in 10k+ line files
- ✅ No browser freezing
- ✅ Fast validation (<100ms for large files)
- ✅ Automatic performance mode activation

## Testing Recommendations

1. **Test with 8k line JSON file**
   - Paste entire file - should be instant
   - Type in the editor - should be responsive with 300ms debounce
   - Format button - still works (uses format.ts utility)

2. **Test with small JSON file (<1000 lines)**
   - All features should work normally
   - Format on paste/type enabled
   - Instant typing feedback

3. **Test validation**
   - Large files: Should see "Structural linting skipped" message
   - Small files: Full validation with linting

## Files Modified

1. `/components/studio/MonacoEditor.tsx` - Editor performance optimizations
2. `/lib/validation/validator.ts` - Validation performance optimizations

## Additional Notes

- Performance mode is automatic - no user configuration needed
- Users can still manually format using the "Format" button
- Small files maintain full feature set with no compromises
- Large files trade some features for smooth performance
