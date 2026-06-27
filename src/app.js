import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
// import postRoutes from "./routes/post.route.js";
// import projectRoutes from "./routes/project.route.js";
// import contactRoutes from "./routes/contact.route.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/posts", postRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/contact", contactRoutes);

export default app;