# Update Required for All Theme Files

## New Simplified Function

Replace the `openNativeContactApp` function in ALL theme script files with this simple version:

```javascript
function openNativeContactApp(
  websites,
  name,
  company,
  designation,
  email,
  phoneNumber,
  locationInfo,
  socials,
  whatsapp
) {
  // Get the card ID from the current URL
  const pathParts = window.location.pathname.split('/');
  const cardId = pathParts[pathParts.length - 1];
  
  // Use server endpoint to download vCard
  // This works better on iOS as it properly sets headers
  window.location.href = `/profile/vcard/${cardId}`;
}
```

## Files to Update:

1. public/white-blue/script.js
2. public/white-black/script.js
3. public/gold-black/script.js
4. public/sienna/script.js
5. public/orange-black/script.js

(blue-black already updated)

## Why This Works Better:

1. **Server-side generation**: vCard is generated on the server with proper headers
2. **iOS Compatible**: iOS Safari handles server-served files better than client-generated blobs
3. **Simpler code**: No need to build vCard on client side
4. **Consistent behavior**: Same experience across all devices
5. **Proper MIME types**: Server sets correct Content-Type headers

## After Update:

1. Restart server
2. Clear browser cache
3. Test on iOS - file will download and can be opened in Contacts app
4. Test on Android - file will download and can be opened in Contacts app
