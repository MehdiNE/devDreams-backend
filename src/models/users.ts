import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, select: false },
  changedPasswordAt: Number,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

export const UserModel = mongoose.model("User", UserSchema);
