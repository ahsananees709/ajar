import admin from "firebase-admin";
import serviceAccount from "./ajar-83a47-firebase-adminsdk-3v9e3-e85559f42b.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
