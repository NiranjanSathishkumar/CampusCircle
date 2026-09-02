// User.profilePicture / User.profileBanner are stored as
// { filename, cloudinaryUrl, cloudinaryId } (see backend/src/models/User.js) —
// filename holds the default asset URL until the student uploads their own,
// cloudinaryUrl the real one after they do. Never render the object itself
// as an <img src> — React stringifies it to "[object Object]".
export function mediaUrl(media) {
  return media?.cloudinaryUrl || media?.filename || '';
}
