import { prisma } from "../config/prisma.js";
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary.js";

const normalizeRole = (role) => String(role || "").toLowerCase();

const normalizeStatus = (body) => {
  if (body.status === "published" || body.status === "draft") {
    return body.status;
  }

  if (typeof body.isPublished !== "undefined") {
    return body.isPublished === true || body.isPublished === "true"
      ? "published"
      : "draft";
  }

  return "draft";
};

export const createPostService = async (userId, body, file) => {
  console.log("SERVICE userId:", userId);
  console.log("SERVICE body:", body);
  console.log("SERVICE file:", file
    ? {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer,
      }
    : null
  );

  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim();
  const excerpt = String(body.excerpt || "").trim();
  const content = String(body.content || "").trim();
  const category = String(body.category || "").trim();
  const status =
    body.isPublished === "true" || body.isPublished === true
      ? "published"
      : "draft";

  if (!userId) {
    throw new Error("Không xác định được người tạo bài viết");
  }

  if (!title || !slug || !content) {
    throw new Error("Thiếu title, slug hoặc content");
  }

  const existingPost = await prisma.post.findUnique({
    where: { slug },
  });

  if (existingPost) {
    throw new Error("Slug đã tồn tại");
  }

  let thumbnailUrl = null;

  if (file?.buffer) {
    console.log("Uploading to Cloudinary...");
    const uploaded = await uploadBufferToCloudinary(file.buffer, "portfolio/posts");
    console.log("Cloudinary uploaded:", uploaded?.secure_url);
    thumbnailUrl = uploaded.secure_url;
  }

  console.log("Creating post in DB...");
  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      category: category || null,
      status,
      publishedAt: status === "published" ? new Date() : null,
      thumbnailUrl,
      authorId: userId,
    },
  });

  console.log("Created post:", post);
  return post;
};

export const getPublishedPostsService = async () => {
  return prisma.post.findMany({
    where: {
      status: "published",
    },
    orderBy: {
      publishedAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });
};

export const getPostBySlugService = async (slug) => {
  const post = await prisma.post.findFirst({
    where: {
      slug,
      status: "published",
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error("Không tìm thấy bài viết");
  }

  return post;
};

export const getAllPostsAdminService = async () => {
  return prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

export const updatePostService = async (postId, user, body, file) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Bài viết không tồn tại");
  }

  if (
    normalizeRole(user.role) !== "admin" &&
    existingPost.authorId !== user.userId
  ) {
    throw new Error("Bạn không có quyền sửa bài này");
  }

  if (body.slug && body.slug !== existingPost.slug) {
    const duplicatedSlug = await prisma.post.findUnique({
      where: { slug: body.slug },
    });

    if (duplicatedSlug) {
      throw new Error("Slug đã tồn tại");
    }
  }

  const nextStatus =
    typeof body.status !== "undefined" || typeof body.isPublished !== "undefined"
      ? normalizeStatus(body)
      : existingPost.status;

  let nextThumbnailUrl = body.thumbnailUrl ?? existingPost.thumbnailUrl;

  if (file) {
    const uploaded = await uploadBufferToCloudinary(file.buffer, "portfolio/posts");
    nextThumbnailUrl = uploaded.secure_url;
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title: body.title ?? existingPost.title,
      slug: body.slug ?? existingPost.slug,
      excerpt: body.excerpt ?? existingPost.excerpt,
      content: body.content ?? existingPost.content,
      category: body.category ?? existingPost.category,
      thumbnailUrl: nextThumbnailUrl,
      status: nextStatus,
      publishedAt:
        nextStatus === "published"
          ? existingPost.publishedAt || new Date()
          : null,
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  return updatedPost;
};

export const deletePostService = async (postId, user) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Bài viết không tồn tại");
  }

  if (
    normalizeRole(user.role) !== "admin" &&
    existingPost.authorId !== user.userId
  ) {
    throw new Error("Bạn không có quyền xóa bài này");
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: "Xóa bài viết thành công" };
};