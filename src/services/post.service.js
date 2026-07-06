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

const requireNonEmptyString = (value, label) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    throw new Error(`${label} không được để trống`);
  }
  return normalized;
};

const getOptionalTrimmedString = (value) => {
  if (typeof value === "undefined") return undefined;
  return String(value || "").trim();
};

const parseJsonField = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const sanitizeLinks = (rawLinks) => {
  return parseJsonField(rawLinks)
    .map((item) => ({
      label: String(item?.label || "").trim(),
      url: String(item?.url || "").trim(),
      sortOrder: Number.isFinite(Number(item?.sortOrder))
        ? Number(item.sortOrder)
        : 0,
    }))
    .filter((item) => item.label && item.url);
};

const sanitizeImageMetas = (rawImages) => {
  return parseJsonField(rawImages).map((item) => ({
    alt: String(item?.alt || "").trim() || null,
    sortOrder: Number.isFinite(Number(item?.sortOrder))
      ? Number(item.sortOrder)
      : 0,
    url: String(item?.url || "").trim() || null,
  }));
};

const normalizeImagesData = (items = []) => {
  return items
    .map((item, index) => ({
      url: String(item?.url || "").trim(),
      alt: String(item?.alt || "").trim() || null,
      sortOrder: Number.isFinite(Number(item?.sortOrder))
        ? Number(item.sortOrder)
        : index,
    }))
    .filter((item) => item.url);
};

const uploadManyFilesToCloudinary = async (
  files = [],
  folder = "portfolio/posts",
) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const uploads = await Promise.all(
    files
      .filter((file) => file?.buffer)
      .map((file) => uploadBufferToCloudinary(file.buffer, folder)),
  );

  return uploads.map((item) => item.secure_url).filter(Boolean);
};

export const createPostService = async (userId, body, files = {}) => {
  const title = requireNonEmptyString(body.title, "Title");
  const slug = requireNonEmptyString(body.slug, "Slug");
  const content = requireNonEmptyString(body.content, "Content");
  const excerpt = getOptionalTrimmedString(body.excerpt) || "";
  const category = getOptionalTrimmedString(body.category) || "";
  const status = normalizeStatus(body);

  if (!userId) {
    throw new Error("Không xác định được người tạo bài viết");
  }

  const existingPost = await prisma.post.findUnique({
    where: { slug },
  });

  if (existingPost) {
    throw new Error("Slug đã tồn tại");
  }

  const thumbnailFile = files.thumbnail?.[0] || null;
  const imageFiles = files.images || [];

  let thumbnailUrl = getOptionalTrimmedString(body.thumbnailUrl) || null;

  if (thumbnailFile?.buffer) {
    const uploaded = await uploadBufferToCloudinary(
      thumbnailFile.buffer,
      "portfolio/posts/thumbnail",
    );
    thumbnailUrl = uploaded.secure_url;
  }

  const uploadedImageUrls = await uploadManyFilesToCloudinary(
    imageFiles,
    "portfolio/posts/gallery",
  );

  const imageMetas = sanitizeImageMetas(body.imageMetas);
  const links = sanitizeLinks(body.links);

  const imagesData = normalizeImagesData([
    ...uploadedImageUrls.map((url, index) => ({
      url,
      alt: imageMetas[index]?.alt || null,
      sortOrder: imageMetas[index]?.sortOrder ?? index,
    })),
    ...imageMetas.slice(uploadedImageUrls.length),
  ]);

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
      links: {
        create: links.map((item, index) => ({
          label: item.label,
          url: item.url,
          sortOrder: item.sortOrder ?? index,
        })),
      },
      images: {
        create: imagesData.map((item, index) => ({
          url: item.url,
          alt: item.alt,
          sortOrder: item.sortOrder ?? index,
        })),
      },
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      links: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

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
      links: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

export const getPostBySlugService = async (slug) => {
  const normalizedSlug = String(slug || "").trim();

  if (!normalizedSlug) {
    throw new Error("Slug không hợp lệ");
  }

  const post = await prisma.post.findUnique({
    where: {
      slug: normalizedSlug,
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
      links: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
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
      links: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
};

export const updatePostService = async (postId, user, body, files = {}) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      links: true,
      images: true,
    },
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

  const nextSlug =
    typeof body.slug !== "undefined"
      ? requireNonEmptyString(body.slug, "Slug")
      : existingPost.slug;

  if (nextSlug !== existingPost.slug) {
    const duplicatedSlug = await prisma.post.findUnique({
      where: { slug: nextSlug },
    });

    if (duplicatedSlug) {
      throw new Error("Slug đã tồn tại");
    }
  }

  const nextStatus =
    typeof body.status !== "undefined" || typeof body.isPublished !== "undefined"
      ? normalizeStatus(body)
      : existingPost.status;

  const thumbnailFile = files.thumbnail?.[0] || null;
  const imageFiles = files.images || [];

  let nextThumbnailUrl =
    typeof body.thumbnailUrl !== "undefined"
      ? getOptionalTrimmedString(body.thumbnailUrl) || null
      : existingPost.thumbnailUrl;

  if (thumbnailFile?.buffer) {
    const uploaded = await uploadBufferToCloudinary(
      thumbnailFile.buffer,
      "portfolio/posts/thumbnail",
    );
    nextThumbnailUrl = uploaded.secure_url;
  }

  const uploadedImageUrls = await uploadManyFilesToCloudinary(
    imageFiles,
    "portfolio/posts/gallery",
  );

  const imageMetas = sanitizeImageMetas(body.imageMetas);
  const links = sanitizeLinks(body.links);

  const shouldReplaceImages =
    Array.isArray(files.images) || typeof body.imageMetas !== "undefined";

  const nextImagesData = normalizeImagesData([
    ...uploadedImageUrls.map((url, index) => ({
      url,
      alt: imageMetas[index]?.alt || null,
      sortOrder: imageMetas[index]?.sortOrder ?? index,
    })),
    ...imageMetas.slice(uploadedImageUrls.length),
  ]);

  const nextTitle =
    typeof body.title !== "undefined"
      ? requireNonEmptyString(body.title, "Title")
      : existingPost.title;

  const nextContent =
    typeof body.content !== "undefined"
      ? requireNonEmptyString(body.content, "Content")
      : existingPost.content;

  const nextExcerpt =
    typeof body.excerpt !== "undefined"
      ? getOptionalTrimmedString(body.excerpt) || null
      : existingPost.excerpt;

  const nextCategory =
    typeof body.category !== "undefined"
      ? getOptionalTrimmedString(body.category) || null
      : existingPost.category;

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title: nextTitle,
      slug: nextSlug,
      excerpt: nextExcerpt,
      content: nextContent,
      category: nextCategory,
      thumbnailUrl: nextThumbnailUrl,
      status: nextStatus,
      publishedAt:
        nextStatus === "published"
          ? existingPost.publishedAt || new Date()
          : null,
      links:
        typeof body.links !== "undefined"
          ? {
              deleteMany: {},
              create: links.map((item, index) => ({
                label: item.label,
                url: item.url,
                sortOrder: item.sortOrder ?? index,
              })),
            }
          : undefined,
      images: shouldReplaceImages
        ? {
            deleteMany: {},
            create: nextImagesData.map((item, index) => ({
              url: item.url,
              alt: item.alt,
              sortOrder: item.sortOrder ?? index,
            })),
          }
        : undefined,
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      links: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      images: {
        orderBy: {
          sortOrder: "asc",
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