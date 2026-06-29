import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
// import projectRoutes from "./routes/project.route.js";
// import contactRoutes from "./routes/contact.route.js";

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// router
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/contact", contactRoutes);

export default app;