import { Router } from "express";
import jwt from "jsonwebtoken";
import db from "../db/connection";
import admin from "../config/firebase";
import { driverMaster } from "../db/schema";
import { eq } from "drizzle-orm";
const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { mobile, firebaseUid } = req.body;

    if (!mobile || !firebaseUid) {
      return res.status(400).json({ error: "mobile & firebaseUid required" });
    }

    // Validate Firebase UID
    const userRecord = await admin.auth().getUser(firebaseUid);

    const cleanFirebase = userRecord.phoneNumber?.replace(/\D/g, "");
    const cleanMobile = mobile.replace(/\D/g, "");

    if (!cleanFirebase?.endsWith(cleanMobile)) {
      return res.status(403).json({ error: "Phone validation failed" });
    }

    // // Check or create driver
    // let user = await pool.query(
    //   "SELECT * FROM driver_master WHERE mobile = $1",
    //   [mobile]
    // );

    // if (user.rows.length === 0) {
    //   user = await pool.query(
    //     "INSERT INTO driver_master (mobile, firebase_uid, role) VALUES ($1,$2,$3) RETURNING *",
    //     [mobile, firebaseUid, "driver"]
    //   );
    // } else {
    //   await pool.query(
    //     "UPDATE driver_master SET firebase_uid=$1 WHERE mobile=$2",
    //     [firebaseUid, mobile]
    //   );
    // }

    // 🔍 Check if driver exists in DB
    const existingUser = await db
        .select()
        .from(driverMaster)
        .where(eq(driverMaster.mobileNo, mobile));

    if (existingUser.length === 0) {
        return res.status(404).json({ message: "Driver not found" });
    }

    const driver = existingUser[0];

    // const driver = user.rows[0];

    // Create JWT token for mobile app
    const token = jwt.sign(
      {
        id: driver.driverId,
        mobile: driver.mobileNo,
        role: "driver",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      user: driver,
      token: token,
    });
  } catch (err: any) {
    console.log("MOBILE LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
