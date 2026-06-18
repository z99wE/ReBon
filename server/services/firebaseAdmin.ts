import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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
    console.warn("Failed to initialize Firebase Admin with credentials, falling back to default:", error);
    app = initializeApp({ projectId: "buildwithai-499306" });
  }
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
