import {
  createPostService,
  getPublishedPostsService,
  getPostBySlugService,
  getAllPostsAdminService,
  updatePostService,
  deletePostService,
} from "../services/post.service.js";

const getErrorStatus = (message) => {
  if (
    message === "Không xác định được người tạo bài viết" ||
    message === "Unauthorized"
  ) {
    return 401;
  }

  if (
    message === "Title không được để trống" ||
    message === "Slug không được để trống" ||
    message === "Content không được để trống" ||
    message === "Slug không hợp lệ"
  ) {
    return 400;
  }

  if (message === "Bài viết không tồn tại" || message === "Không tìm thấy bài viết") {
    return 404;
  }

  if (
    message === "Bạn không có quyền sửa bài này" ||
    message === "Bạn không có quyền xóa bài này"
  ) {
    return 403;
  }

  if (message === "Slug đã tồn tại") {
    return 409;
  }

  return 500;
};

export const createPostController = async (req, res) => {
  try {
    const post = await createPostService(req.user?.userId, req.body, req.files);

    return res.status(201).json({
      message: "Tạo bài viết thành công",
      data: post,
    });
  } catch (error) {
    const message = error.message || "Tạo bài viết thất bại";

    return res.status(getErrorStatus(message)).json({ message });
  }
};

export const getPublishedPostsController = async (req, res) => {
  try {
    const posts = await getPublishedPostsService();

    return res.status(200).json({
      message: "Lấy danh sách bài viết thành công",
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lấy danh sách bài viết thất bại",
    });
  }
};

export const getPostBySlugController = async (req, res) => {
  try {
    const post = await getPostBySlugService(req.params.slug);

    return res.status(200).json({
      message: "Lấy chi tiết bài viết thành công",
      data: post,
    });
  } catch (error) {
    const message = error.message || "Lấy chi tiết bài viết thất bại";

    return res.status(getErrorStatus(message)).json({ message });
  }
};

export const getAllPostsAdminController = async (req, res) => {
  try {
    const posts = await getAllPostsAdminService();

    return res.status(200).json({
      message: "Lấy toàn bộ bài viết thành công",
      data: posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lấy toàn bộ bài viết thất bại",
    });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const post = await updatePostService(
      req.params.id,
      req.user,
      req.body,
      req.files,
    );

    return res.status(200).json({
      message: "Cập nhật bài viết thành công",
      data: post,
    });
  } catch (error) {
    console.error("updatePostController error:", error);

    const message = error.message || "Cập nhật bài viết thất bại";

    return res.status(getErrorStatus(message)).json({ message });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const result = await deletePostService(req.params.id, req.user);

    return res.status(200).json(result);
  } catch (error) {
    const message = error.message || "Xóa bài viết thất bại";

    return res.status(getErrorStatus(message)).json({ message });
  }
};