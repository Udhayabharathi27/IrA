import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import argon2 from "argon2";
import { storage } from "./storage";
import type { User } from "@shared/schema";

// Serialize user for session
