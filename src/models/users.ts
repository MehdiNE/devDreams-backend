import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String, required: true },
  password: { type: String, select: false },
  refreshToken: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  authMethods: [{ type: String, enum: ["local", "google", "github"] }],
  changedPasswordAt: Number,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

export const UserModel = mongoose.model("User", UserSchema);
