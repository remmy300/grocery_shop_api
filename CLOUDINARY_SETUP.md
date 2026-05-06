# Cloudinary Image Upload Setup Guide

This guide explains how to configure Cloudinary for image uploads in the Grocery Shop admin dashboard.

## 1. Backend Setup (Already Configured ✅)

The backend is already configured with:

- Cloudinary credentials in `.env` file
- Routes for signature generation (`/api/cloudinary/config`, `/api/cloudinary/signature`)
- Secure signature validation using SHA1 hashing

**Required Environment Variables:**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 2. Frontend Setup (Partially Complete)

The frontend has:

- `ImageUpload` component in `src/components/ImageUpload.tsx`
- `useImageUpload` hook in `src/hooks/useImageUpload.ts`
- Cloudinary Uploader widget library loaded via CDN

**Required Environment Variable:**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## 3. Configuring Unsigned Uploads (RECOMMENDED)

For the most streamlined upload experience, configure an **unsigned upload preset** in Cloudinary:

### Steps:

1. **Log into [Cloudinary Dashboard](https://cloudinary.com/console)**

2. **Navigate to Settings:**
   - Click **Settings** (gear icon) in the top navigation
   - Go to **Upload** tab

3. **Create an Upload Preset:**
   - Scroll down to **Upload presets** section
   - Click **Add upload preset**
   - Fill in the form:
     - **Name:** `grocery_shop_unsigned` (or your choice)
     - **Signing Mode:** Select **Unsigned**
     - **Folder:** `grocery_shop/products` (optional, for organization)
     - **Resource type:** Image
   - Click **Save**

4. **Update Frontend Component:**

   After creating the preset, update the `unsigned_preset` value in `ImageUpload.tsx`:

   ```typescript
   // Line ~80 in ImageUpload.tsx
   const cldWidget = window.cloudinary.v2.uploader.open(
     {
       cloudName: config.cloudName,
       uploadPreset: "grocery_shop_unsigned", // ← Update with your preset name
       folder: "grocery_shop/products",
       resourceType: "image",
       // ... rest of config
     },
     // ... callback
   );
   ```

## 4. Integration Examples

### Using ImageUpload Component Directly

```typescript
import ImageUpload from "@/components/ImageUpload";

export function AddProductForm() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <>
      <ImageUpload
        onUploadSuccess={(url, publicId) => {
          setImageUrl(url);
          console.log("Image uploaded:", publicId);
        }}
        onUploadError={(error) => {
          console.error("Upload failed:", error);
        }}
      />
      {imageUrl && <img src={imageUrl} alt="Product" />}
    </>
  );
}
```

### Using useImageUpload Hook

```typescript
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "@/components/ImageUpload";

export function EditProductForm() {
  const { uploadedImage, error, handleUploadSuccess, resetUpload } =
    useImageUpload({
      onSuccess: (url, publicId) => {
        console.log("Product image updated:", publicId);
      },
    });

  return (
    <>
      <ImageUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={(err) => console.error(err)}
      />
      {error && <p className="text-red-500">{error}</p>}
      {uploadedImage && <p className="text-green-500">Upload successful!</p>}
    </>
  );
}
```

## 5. Image Optimization with Cloudinary URLs

Cloudinary allows you to transform images via URL parameters. Examples:

```
// Original
https://res.cloudinary.com/cloud-name/image/upload/public-id.jpg

// Resize to 300x200
https://res.cloudinary.com/cloud-name/image/upload/w_300,h_200,c_fill/public-id.jpg

// Add quality optimization
https://res.cloudinary.com/cloud-name/image/upload/w_300,h_200,c_fill,q_auto/public-id.jpg

// Convert to WebP for smaller file size
https://res.cloudinary.com/cloud-name/image/upload/w_300,h_200,c_fill,q_auto,f_webp/public-id.jpg
```

Use these in `next/image` for automatic optimization:

```typescript
import Image from "next/image";

export function ProductImage({ publicId }: { publicId: string }) {
  const cloudinaryUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,h_400,c_fill,q_auto/`;

  return (
    <Image
      src={`${cloudinaryUrl}${publicId}.jpg`}
      alt="Product"
      width={400}
      height={400}
    />
  );
}
```

## 6. Troubleshooting

### Issue: "Invalid unsigned preset"

**Solution:** Make sure you've created an unsigned upload preset in Cloudinary dashboard and updated the `unsigned_preset` value in the component.

### Issue: "CORS error on image upload"

**Solution:** Ensure Cloudinary CORS settings include your frontend domain:

1. Settings → Upload
2. Add your domain to **Allowed origins** (e.g., `http://localhost:3001`)

### Issue: "Signature validation failed"

**Solution:** Verify backend environment variables:

```bash
# In backend/.env
echo "CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME"
echo "CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY"
echo "CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET"
```

### Issue: Widget doesn't appear

**Solution:** Check browser console for errors. Verify:

1. Cloudinary uploader script is loaded (check Network tab)
2. Cloud name is set correctly in `config`
3. No JavaScript errors in console

## 7. Security Best Practices

✅ **Currently Implemented:**

- Signatures generated server-side with SHA1 hash
- API secret never exposed to frontend
- Timestamps prevent replay attacks
- Folder restriction to `grocery_shop/products`

✅ **Additional Recommendations:**

- Set upload limits in Cloudinary dashboard (max file size, formats)
- Use transformation eager delivery for automatic resizing
- Enable account-level upload presets for consistency
- Regularly monitor Cloudinary usage in dashboard

## 8. Next Steps

1. ✅ Backend configured with signature generation
2. ✅ Frontend component created and ready to use
3. ⏳ **TODO:** Create unsigned upload preset in Cloudinary
4. ⏳ **TODO:** Integrate ImageUpload into product creation form
5. ⏳ **TODO:** Integrate ImageUpload into product edit form
6. ⏳ **TODO:** Test end-to-end image upload flow

## 9. API Reference

### GET /api/cloudinary/config

Returns Cloudinary configuration needed by frontend.

**Response:**

```json
{
  "cloudName": "dmsicle2b",
  "uploadEndpoint": "https://api.cloudinary.com/v1_1/dmsicle2b/image/upload"
}
```

### POST /api/cloudinary/signature

Generates a secure signature for unsigned uploads.

**Request Body:**

```json
{
  "publicId": "grocery_shop/products/banana-yellow-001",
  "timestamp": 1640000000
}
```

**Response:**

```json
{
  "signature": "abc123def456...",
  "timestamp": 1640000000,
  "apiKey": "743241184622689"
}
```

---

**For more info:** [Cloudinary Upload Documentation](https://cloudinary.com/documentation/upload_widget)
