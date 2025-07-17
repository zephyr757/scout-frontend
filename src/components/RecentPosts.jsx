import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import PostCard from './PostCard';

function RecentPosts({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 font-thin">
        <PhotoIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-light">No recent posts found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default RecentPosts;