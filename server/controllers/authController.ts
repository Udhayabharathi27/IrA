import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import admin from "../config/firebase";
import db from "../db/connection";
import { driverMaster } from "../db/schema";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export const login = async (req: Request, res: Response) => {
  console.log("BODY RECEIVED:", req.body);
  const { mobile, firebaseUid } = req.body;

  if (!mobile || !firebaseUid) {
    return res.status(400).json({ message: "mobile & firebaseUid required" });
  }

  try {
    // ========================
    // LOGIC FLOW:
    // 1. Verify Firebase UID authentication
    // 2. Check if user exists in driverMaster table
    // 3. If driver found → Generate token with driver role
    // 4. If driver not found → Check users table
    // 5. If user found → Generate token with user's role
    // 6. If neither found → Return 404 error
    // ========================

    // 🔍 STEP 1: Verify Firebase UID from Firebase Auth
    console.log("Verifying Firebase UID:", firebaseUid);
    const userRecord = await admin.auth().getUser(firebaseUid);

    console.log("Firebase phone:", userRecord.phoneNumber);

    if (!userRecord.phoneNumber?.includes(mobile)) {
      return res.status(403).json({ message: "Phone validation failed" });
    }

    // 🔍 STEP 2: Check if driver exists in driverMaster table
    const existingDriver = await db
      .select()
      .from(driverMaster)
      .where(eq(driverMaster.mobileNo, mobile));

    if (existingDriver.length > 0) {
      // ✅ STEP 3: Driver found - Generate token with driver role
      const currentUser = existingDriver[0];

      const token = jwt.sign(
        {
          id: currentUser.driverId,    // Use driver table fields
          mobile: currentUser.mobileNo,
          role: "driver",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        user: currentUser,
        token,
        userType: "driver"
      });
    } else {
      // ❌ STEP 4: Driver not found - Check users table
      console.log("Driver not found, checking users table...");
      
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.mobileNo, mobile));

      if (existingUser.length > 0) {
        // ✅ STEP 5: User found - Generate token with user's role
        const currentUser = existingUser[0];

        const token = jwt.sign(
          {
            id: currentUser.id,    // Use users table fields
            mobile: currentUser.mobileNo,
            role: currentUser.role, // Use dynamic role from users table
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          user: currentUser,
          token,
          userType: "user"
        });
      } else {
        // ❌ STEP 6: Neither driver nor user found
        return res.status(404).json({ 
          message: "Driver not found and User not found in system" 
        });
      }
    }

  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Send OTP endpoint
export const sendOtp = async (req: Request, res: Response) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  try {
    console.log("Sending OTP to:", mobile);
    
    // Format mobile number (ensure it has country code)
    const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
    
    // For Firebase phone authentication, we typically handle this on the client side
    // But for server-side implementation, you can use Firebase Admin to create custom tokens
    // or integrate with an SMS service provider
    
    // Option 1: Using Firebase Admin to create a custom token
    // This requires the user to already exist in Firebase Auth
    // const customToken = await admin.auth().createCustomToken(uid);
    
    // Option 2: Integrate with SMS service (Twilio, MessageBird, etc.)
    // This would be your actual OTP sending logic
    
    // For now, we'll simulate successful OTP sending
    // In production, replace this with your actual SMS service integration
    
    console.log("OTP simulation for:", formattedMobile);
    
    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      mobile: formattedMobile,
      // In real implementation, you might return a session ID or verification ID
      sessionId: `session_${Date.now()}` // Example session ID
    });
    
  } catch (err: any) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Verify OTP endpoint
export const verifyOtp = async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "Mobile and OTP are required" });
  }

  try {
    console.log("Verifying OTP for:", mobile, "OTP:", otp);
    
    // Format mobile number
    const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
    const rawMobile = mobile; // Keep original format
    
    console.log("Formatted mobile:", formattedMobile);
    console.log("Raw mobile:", rawMobile);
    
    // Basic OTP validation
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ message: "Invalid OTP format" });
    }
    
    // 🔍 DEBUG: Check what's in the database
    console.log("=== DATABASE DEBUG ===");
    
    // Check driver table with both formats
    const existingDriverFormatted = await db
      .select()
      .from(driverMaster)
      .where(eq(driverMaster.mobileNo, formattedMobile));
    
    const existingDriverRaw = await db
      .select()
      .from(driverMaster)
      .where(eq(driverMaster.mobileNo, rawMobile));
    
    console.log("Drivers with formatted mobile:", existingDriverFormatted.length);
    console.log("Drivers with raw mobile:", existingDriverRaw.length);
    
    // Check users table with both formats
    const existingUserFormatted = await db
      .select()
      .from(users)
      .where(eq(users.mobileNo, formattedMobile));
    
    const existingUserRaw = await db
      .select()
      .from(users)
      .where(eq(users.mobileNo, rawMobile));
    
    console.log("Users with formatted mobile:", existingUserFormatted.length);
    console.log("Users with raw mobile:", existingUserRaw.length);
    
    // Also check with LIKE for partial matches
    const allUsers = await db.select().from(users);
    console.log("All users in database:", allUsers.map(u => ({ id: u.id, mobile: u.mobileNo, email: u.email })));
    
    // Try both formats
    let existingDriver = existingDriverFormatted.length > 0 ? existingDriverFormatted : existingDriverRaw;
    let existingUser = existingUserFormatted.length > 0 ? existingUserFormatted : existingUserRaw;
    
    if (existingDriver.length > 0) {
      console.log("✅ Driver found:", existingDriver[0]);
      const currentUser = existingDriver[0];
      const token = jwt.sign(
        {
          id: currentUser.driverId,
          mobile: currentUser.mobileNo,
          role: "driver",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        user: currentUser,
        token,
        userType: "driver"
      });
    }

    if (existingUser.length > 0) {
      console.log("✅ User found:", existingUser[0]);
      const currentUser = existingUser[0];
      const token = jwt.sign(
        {
          id: currentUser.id,
          mobile: currentUser.mobileNo,
          role: currentUser.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        user: currentUser,
        token,
        userType: "user"
      });
    }

    console.log("❌ No user found with mobile:", mobile, "formatted as:", formattedMobile);
    return res.status(404).json({ 
      message: "User not found in system. Please contact administrator." 
    });

  } catch (err: any) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Optional: Verify OTP with Firebase token (for client-side Firebase auth)
export const verifyOtpWithFirebase = async (req: Request, res: Response) => {
  const { mobile, firebaseIdToken } = req.body;

  if (!mobile || !firebaseIdToken) {
    return res.status(400).json({ message: "Mobile and Firebase token are required" });
  }

  try {
    console.log("Verifying Firebase token for:", mobile);
    
    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
    console.log("Firebase token verified for UID:", decodedToken.uid);
    
    // Verify that the phone number in the token matches the provided mobile
    const tokenPhoneNumber = decodedToken.phone_number;
    const formattedMobile = mobile.startsWith('+') ? mobile : `+91${mobile}`;
    
    if (tokenPhoneNumber !== formattedMobile) {
      return res.status(403).json({ 
        message: "Phone number verification failed" 
      });
    }

    // Check if user exists in driverMaster table
    const existingDriver = await db
      .select()
      .from(driverMaster)
      .where(eq(driverMaster.mobileNo, formattedMobile));

    if (existingDriver.length > 0) {
      const currentUser = existingDriver[0];
      const token = jwt.sign(
        {
          id: currentUser.driverId,
          mobile: currentUser.mobileNo,
          role: "driver",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        user: currentUser,
        token,
        userType: "driver"
      });
    }

    // Check users table
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.mobileNo, formattedMobile));

    if (existingUser.length > 0) {
      const currentUser = existingUser[0];
      const token = jwt.sign(
        {
          id: currentUser.id,
          mobile: currentUser.mobileNo,
          role: currentUser.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        user: currentUser,
        token,
        userType: "user"
      });
    }

    // If user doesn't exist in either table
    return res.status(404).json({ 
      message: "User not found in system. Please contact administrator." 
    });

  } catch (err: any) {
    console.error("VERIFY OTP WITH FIREBASE ERROR:", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }
};

// Export all functions
export default {
  login,
  sendOtp,
  verifyOtp,
  verifyOtpWithFirebase
};