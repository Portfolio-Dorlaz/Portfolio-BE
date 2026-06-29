import {
  createPostService,
  getPublishedPostsService,
  getPostBySlugService,
  getAllPostsAdminService,
  updatePostService,
  deletePostService,
} from "../services/post.service.js";

export const createPostController = async (req, res) => {
    try {
        console.log(req.body);
    const post = await createPostService(req.user.userId, req.body, req.file);
    return res.status(201).json(post);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getPublishedPostsController = async (req, res) => {
  try {
    const posts = await getPublishedPostsService();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPostBySlugController = async (req, res) => {
  try {
    const post = await getPostBySlugService(req.params.slug);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

export const getAllPostsAdminController = async (req, res) => {
  try {
    const posts = await getAllPostsAdminService();
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const post = await updatePostService(req.params.id, req.user, req.body);
    return res.status(200).json(post);
  } catch (error) {
    const status =
      error.message === "Bài viết không tồn tại"
        ? 404
        : error.message === "Bạn không có quyền sửa bài này"
        ? 403
        : 400;

    return res.status(status).json({ message: error.message });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const result = await deletePostService(req.params.id, req.user);
    return res.status(200).json(result);
  } catch (error) {
    const status =
      error.message === "Bài viết không tồn tại"
        ? 404
        : error.message === "Bạn không có quyền xóa bài này"
        ? 403
        : 400;

    return res.status(status).json({ message: error.message });
  }
};