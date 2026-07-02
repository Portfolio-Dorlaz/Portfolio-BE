import { prisma } from "../config/prisma.js";

export const createCommentService = async (userId, body) => {
  const { postId, content, parentId } = body;

  if (!postId || !content) {
    throw new Error("Thiếu postId hoặc content");
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Bài viết không tồn tại");
  }

  if (parentId) {
    const existingParentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });

    if (!existingParentComment) {
      throw new Error("Comment cha không tồn tại");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: userId,
      parentId: parentId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return comment;
};

export const getCommentsByPostService = async (postId) => {
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error("Bài viết không tồn tại");
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
    },
    orderBy: {
      createdAt: "asc",
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

  const commentMap = new Map();

  comments.forEach((comment) => {
    commentMap.set(comment.id, {
      ...comment,
      replies: [],
    });
  });

  const rootComments = [];

  comments.forEach((comment) => {
    const currentComment = commentMap.get(comment.id);

    if (comment.parentId) {
      const parentComment = commentMap.get(comment.parentId);

      if (parentComment) {
        parentComment.replies.push(currentComment);
      } else {
        rootComments.push(currentComment);
      }
    } else {
      rootComments.push(currentComment);
    }
  });

  return rootComments;
};

export const getCommentByIdService = async (commentId) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment không tồn tại");
  }

  return comment;
};

export const getAllCommentsAdminService = async () => {
  return prisma.comment.findMany({
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
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
};

export const updateCommentService = async (commentId, user, body) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error("Comment không tồn tại");
  }

  if (user.role !== "ADMIN" && existingComment.authorId !== user.userId) {
    throw new Error("Bạn không có quyền sửa comment này");
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: body.content,
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return updatedComment;
};

export const deleteCommentService = async (commentId, user) => {
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error("Comment không tồn tại");
  }

  if (user.role !== "ADMIN" && existingComment.authorId !== user.userId) {
    throw new Error("Bạn không có quyền xóa comment này");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { message: "Xóa comment thành công" };
};