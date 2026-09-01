import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    projectId: "gen-lang-client-0890735580",
  });
}

export const adminAuth = getAuth();
