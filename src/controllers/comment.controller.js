import {
  createCommentService,
  getCommentsByPostService,
  getCommentByIdService,
  getAllCommentsAdminService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service.js";

export const createCommentController = async (req, res) => {
  try {
    const comment = await createCommentService(req.user.userId, req.body);
    return res.status(201).json({
      message: "Tạo comment thành công",
      data: comment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Tạo comment thất bại",
    });
  }
};

export const getCommentsByPostController = async (req, res) => {
  try {
    const comments = await getCommentsByPostService(req.params.postId);
    return res.status(200).json({
      message: "Lấy danh sách comment thành công",
      data: comments,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message || "Lấy comment thất bại",
    });
  }
};

export const getCommentByIdController = async (req, res) => {
  try {
    const comment = await getCommentByIdService(req.params.commentId);
    return res.status(200).json({
      message: "Lấy chi tiết comment thành công",
      data: comment,
    });
  } catch (error) {
    return res.status(404).json({
      message: error.message || "Không tìm thấy comment",
    });
  }
};

export const getAllCommentsAdminController = async (req, res) => {
  try {
    const comments = await getAllCommentsAdminService();
    return res.status(200).json({
      message: "Lấy tất cả comment thành công",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Lấy tất cả comment thất bại",
    });
  }
};

export const updateCommentController = async (req, res) => {
  try {
    const comment = await updateCommentService(req.params.commentId, req.user, req.body);
    return res.status(200).json({
      message: "Cập nhật comment thành công",
      data: comment,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Cập nhật comment thất bại",
    });
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    const result = await deleteCommentService(req.params.commentId, req.user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Xóa comment thất bại",
    });
  }
};