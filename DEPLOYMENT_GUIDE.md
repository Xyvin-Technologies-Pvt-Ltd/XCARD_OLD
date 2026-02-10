# Quick Deployment Guide

## 🚀 Deploy the vCard Fix

### Step 1: Restart Your Server

```bash
# If using PM2
pm2 restart all

# If using nodemon (development)
# Just save a file or restart manually

# If running directly
# Stop the server (Ctrl+C) and restart
node server.js
```

### Step 2: Clear Your Mobile Browser Cache

#### iOS (Safari):
1. Open **Settings** app
2. Scroll down to **Safari**
3. Tap **Clear History and Website Data**
4. Confirm

#### Android (Chrome):
1. Open **Chrome** app
2. Tap **⋮** (three dots) → **Settings**
3. Tap **Privacy** → **Clear browsing data**
4. Select **Cached images and files**
5. Tap **Clear data**

### Step 3: Test the Fix

1. Open your profile page on mobile browser
2. Click the **"Save Contact"** button
3. **Expected Result**: Native contact app opens with pre-filled information
4. Tap "Save" or "Add Contact" to save

---

## ✅ What Was Fixed

### 1. JavaScript Files (Already Done ✅)
All theme script files now use:
```javascript
window.location.href = vcardDataUri;
```
Instead of downloading files.

### 2. EJS Templates (Just Fixed ✅)
All templates now have cache-busting version:
```html
<script src="/profile/public/blue-black/script.js?v=2.0" ...>
```

### 3. Syntax Error (Fixed ✅)
Fixed missing function declaration in `blue-black/script.js`

---

## 🧪 Quick Test

### Test URL Format:
```
https://your-domain.com/profile/[cardId]
```

### What Should Happen:
- **Mobile**: Contact app opens → Pre-filled data → Save
- **Desktop**: .vcf file downloads → Import to contacts

---

## ⚠️ If Still Not Working

### Option 1: Hard Refresh
- **iOS**: Hold refresh button → "Request Desktop Site" → Reload
- **Android**: Settings → Site settings → Clear & reset

### Option 2: Incognito/Private Mode
- Test in private browsing mode
- This bypasses all cache

### Option 3: Check Browser Console
1. Enable developer mode on mobile
2. Connect to desktop
3. Check for JavaScript errors

---

## 📞 Support

If issues persist:
1. Check `CACHE_BUSTING_SOLUTION.md` for detailed troubleshooting
2. Verify server is running latest code
3. Test with different profiles
4. Check browser compatibility

---

**Quick Reference**:
- Version: `2.0`
- Cache Busting: `?v=2.0` added to all scripts
- Status: ✅ Ready for production
