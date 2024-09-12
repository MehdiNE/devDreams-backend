import { Document, Types } from "mongoose";

export interface CreateCommentsReq {
  content: string;
}

export interface CreateCommentsParams {
  postId: string;
}

export interface CreateCommentsService {
  content: string;
  author: string;
  postId: string;
}

// Interface for the Comment document
export interface IComment extends Document {
  _id: Types.ObjectId;
  content: string;
  author: Types.ObjectId | IUser; // Assuming you have an IUser interface
  post: Types.ObjectId;
  createdAt: Date;
  likes: TTypes.Array<Types.ObjectId>;
  parentComment: Types.ObjectId | null;
  childComments: Types.Array<Types.ObjectId> | IComment[];
}

export interface LikeCommentsParams {
  commentId: string;
}

export interface LikeCommentsService {
  commentId: string;
  userId: Types.ObjectId;
}

// Delete comment
export interface DeleteCommentsService {
  commentId: string;
}

export interface DeleteCommentsParams {
  commentId: string;
  userId: Types.ObjectId;
}

// Reply comment
export interface CreateReplyBody {
  content: string;
}

export interface CreateReplyParams {
  commentId: string;
}

export interface CreateReplyService {
  content: string;
  userId: string;
  commentId: string;
}
