import mongoose from "mongoose";
import "dotenv/config";

process.on("uncaughtException", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UncaughtException. Shutting down...");
  process.exit(1);
});

import app from "./app";

// Database connection
mongoose
  .connect(process.env.DATABASE_LOCAL ?? "")
  .then(() => console.log("Connected to database"));

const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});

process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  console.log("UnhandledRejection. Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
