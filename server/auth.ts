import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import argon2 from "argon2";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local Strategy (Email/Password)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        if (!user.password) {
          return done(null, false, { message: "Please sign in with Google" });
        }

        const isValidPassword = await argon2.verify(user.password, password);
        
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google OAuth Strategy (optional)
const GOOGLE_CALLBACK_URL = process.env.NODE_ENV === 'production' 
  ? `${process.env.BASE_URL}/api/auth/google/callback`
  : "http://localhost:5000/api/auth/google/callback";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          let user = await storage.getUserByGoogleId(profile.id);
          
          if (!user) {
            user = await storage.getUserByEmail(email);
            
            if (user && !user.googleId) {
              user = await storage.updateUser(user.id, {
                googleId: profile.id,
                photoUrl: profile.photos?.[0]?.value,
              });
            }
          }

          if (!user) {
            user = await storage.createUser({
              email,
              googleId: profile.id,
              firstName: profile.name?.givenName || "",
              lastName: profile.name?.familyName || "",
              displayName: profile.displayName,
              photoUrl: profile.photos?.[0]?.value,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

export default passport;