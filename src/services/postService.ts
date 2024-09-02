import { PostModel } from "../models/posts";
import { DeletePostService, PostRequestService } from "../types/postTypes";
import AppError from "../utils/appError";

function calculateReadingTime(content: string) {
  if (!content || typeof content !== "string") {
    return 0; // Return 0 minutes for empty or non-string content
  }
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export async function createPostService(props: PostRequestService) {
  const { authorId, content, title, tags } = props;

  const newPost = await PostModel.create({
    title,
    content,
    tags,
    author: authorId,
    estimatedReadingTime: calculateReadingTime(content),
  });

  return { newPost };
}

export async function getPostService() {
  const posts = await PostModel.find();

  return { posts };
}

export async function deletePostService({ userId, postId }: DeletePostService) {
  const post = await PostModel.findOneAndDelete({
    _id: postId,
    author: userId,
  });

  if (!post) {
    throw new AppError("Post not found!", 404);
  }
}

export async function getOnePostService(postId: string) {
  const post = await PostModel.findById(postId);

  if (!post) {
    throw new AppError("Post not found!", 404);
  }

  return post;
}
