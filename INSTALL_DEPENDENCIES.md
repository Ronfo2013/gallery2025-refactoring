# 📦 Install Dependencies for New Features

Alcune feature implementate richiedono l'installazione di nuove dipendenze npm.

---

## 🖼️ Image Compression (Task 3.2)

### Package Required
```bash
npm install browser-image-compression
```

### Usage
```typescript
import { compressImage, CompressionPresets } from '@/utils/imageCompression';

// Compress single image
const compressed = await compressImage(originalFile, CompressionPresets.balanced);

// Or custom options
const compressed = await compressImage(originalFile, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  onProgress: (progress) => setProgress(progress)
});
```

### Integration Example (bucketService.ts)
```typescript
import { compressImage } from '@/utils/imageCompression';

export async function uploadPhoto(file: File, albumId: string) {
  // Compress before upload
  const compressedFile = await compressImage(file);

  // Upload compressed file
  const storageRef = ref(storage, `albums/${albumId}/${compressedFile.name}`);
  return await uploadBytes(storageRef, compressedFile);
}
```

**Benefits**:
- 60-80% size reduction
- Faster uploads
- Reduced storage costs
- Better UX (less waiting)

---

## 🎓 Onboarding Tour (Task 4.5.5)

### ⚠️ React 19 Compatibility Issue

`react-joyride` non supporta ancora React 19. Scegli una delle opzioni:

#### **Opzione A: Usa Intro.js (Raccomandato per React 19)**
```bash
npm install intro.js intro.js-react
```

✅ Compatibile React 19
✅ Più leggero
✅ Implementazione già pronta in `OnboardingTour.tsx`

#### **Opzione B: Usa react-joyride con --legacy-peer-deps**
```bash
npm install react-joyride --legacy-peer-deps
npm install --save-dev @types/react-joyride
```

⚠️ Potrebbe avere problemi con React 19
⚠️ Richiede modifiche al componente OnboardingTour

### Usage (Intro.js)
```typescript
import { OnboardingTour } from '@/components/OnboardingTour';

<OnboardingTour autoStart />
```

### Integration Example (BrandDashboard.tsx)
```typescript
import { OnboardingTour } from '@/components/OnboardingTour';

export function BrandDashboard() {
  return (
    <>
      <OnboardingTour />
      {/* Rest of dashboard */}
    </>
  );
}
```

**Benefits**:
- Reduced learning curve
- Better user adoption
- Interactive guidance
- Customizable with brand colors

---

## 📦 Install All at Once

### ✅ Raccomandato (Intro.js - compatibile React 19):
```bash
# Rimuovi react-joyride se già installato
npm uninstall react-joyride react-floater

# Installa dipendenze compatibili
npm install browser-image-compression intro.js intro.js-react --legacy-peer-deps
```

### ⚠️ NON Raccomandato (react-joyride ha conflitti con React 19):
```bash
# ❌ Non usare - causa errori di peer dependency
npm install browser-image-compression react-joyride --legacy-peer-deps
```

**Nota**: react-joyride non supporta React 19. Usa Intro.js.

---

## ✅ Verify Installation

After installation, verify packages are in `package.json`:

```bash
# Check installed versions
npm list browser-image-compression
npm list react-joyride
```

Expected output:
```
gallery2025@1.0.0
├── browser-image-compression@2.x.x
└── react-joyride@2.x.x
```

---

## 🚀 Next Steps

After installing dependencies:

1. **Image Compression**: Update `bucketService.ts` to use `compressImage()`
2. **Onboarding Tour**: Create `OnboardingTour.tsx` component
3. **Build & Test**: Run `npm run build` to verify no errors
4. **Test Features**: Upload images, test onboarding tour

---

## 🆘 Troubleshooting

### "Module not found: browser-image-compression"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
# Install types
npm install --save-dev @types/browser-image-compression
npm install --save-dev @types/react-joyride
```

### Build errors
```bash
# Check if all dependencies are installed
npm install
npm run build
```

---

Last Updated: 2025-12-03
