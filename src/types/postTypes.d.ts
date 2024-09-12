import { ApiResponse } from "./global";

export interface PostRequest {
  title: string;
  content: string;
  tags?: string[];
}

export interface PostRequestService extends PostRequest {
  authorId: string;
}

export interface PostRequestResponse extends ApiResponse {
  data: {
    title: string;
    content: String;
  };
}

export interface PostIdParams {
  id: string;
}

export interface LikePostIdParams {
  postId: string;
}

export interface DeletePostService {
  postId: string;
  userId: string;
}
