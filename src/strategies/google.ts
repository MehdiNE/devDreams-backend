import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { UserModel } from "../models/users";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://127.0.0.1:5000/api/v1/auth/google/redirect",
      scope: ["email", "profile"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        // Check if a user with this Google ID already exists
        let user = await UserModel.findOne({ googleId: profile.id });

        if (!user) {
          // If not, check if a user with this email exists
          user = await UserModel.findOne({ email: profile.emails?.[0].value });

          if (user) {
            // Existing user found, link Google account
            user.googleId = profile.id;
            if (!user.authMethods.includes("google")) {
              user.authMethods.push("google");
            }
          } else {
            // No existing user, create new account
            user = new UserModel({
              email: profile.emails?.[0].value,
              name: profile.displayName,
              googleId: profile.id,
              authMethods: ["google"],
            });
          }
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);
