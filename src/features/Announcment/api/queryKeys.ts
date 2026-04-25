export const announcementKeys = {
  all: ["announcements"] as const,
  posts: () => [...announcementKeys.all, "posts"] as const,
  post: (postId: string) => [...announcementKeys.posts(), postId] as const,
  comments: (postId: string) => [...announcementKeys.post(postId), "comments"] as const,
};

export const courseKeys = {
  all: ["courses"] as const,
  editable: () => [...courseKeys.all, "editable"] as const,
  sections: (courseId: string) => [...courseKeys.all, courseId, "sections"] as const,
};