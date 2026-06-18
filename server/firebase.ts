import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (getApps().length === 0) {
  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      app = initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      // Default initialization (works on GCP natively or with ADC locally)
      app = initializeApp();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    // Initialize default for development without credentials
    app = initializeApp({ projectId: "buildwithai-499306" });
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
