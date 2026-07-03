import express from "express";
import cookieParser from 'cookie-parser';
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
// import projectRoutes from "./routes/project.route.js";
// import contactRoutes from "./routes/contact.route.js";

const app = express();

// middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_DEPLOY,
].filter(Boolean).map((origin) => origin.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

// router
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/contact", contactRoutes);

export default app;