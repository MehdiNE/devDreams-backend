export interface createBookmarkReq {
  postId: string;
}

export interface createBookmarkService {
  postId: string;
  userId: string;
}

export interface getUserBookmarksServiceProps {
  userId: string;
}

export interface DeleteBookmarkParams {
  id: string;
}

export interface DeleteBookmarkService {
  userId: string;
  bookmarkId: string;
}
