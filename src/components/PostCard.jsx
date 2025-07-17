import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ChatBubbleLeftIcon,
  PhotoIcon 
} from '@heroicons/react/24/outline';

function PostCard({ post }) {
  return (
    <div className="border border-gray-100 rounded-lg p-4 hover:shadow-soft transition-all duration-200 bg-white font-thin">
      <div className="flex items-start space-x-3">
        {/* Image */}
        <div className="flex-shrink-0">
          {post.display_image_url ? (
            <img 
              src={post.display_image_url} 
              alt="Post" 
              className="w-16 h-16 object-cover rounded-lg border border-gray-100"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100" style={{ display: post.display_image_url ? 'none' : 'flex' }}>
            <PhotoIcon className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-light text-brand-navy truncate">
              @{post.username}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-lg" role="img" aria-label="tone">{post.tone_emoji}</span>
              {post.should_engage ? (
                <CheckCircleIcon className="w-4 h-4 text-brand-teal" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2 font-extralight">
            {post.caption || 'No caption'}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 font-light">
            <span>
              {formatDistanceToNow(new Date(post.posted_at), { addSuffix: true })}
            </span>
            <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs">
              {post.comment_freshness}
            </span>
          </div>

          {/* Suggested Comment Preview */}
          {post.suggested_comment && (
            <div className="mt-3 p-3 bg-brand-teal/5 rounded border border-brand-teal/20">
              <div className="flex items-start space-x-2">
                <ChatBubbleLeftIcon className="w-4 h-4 text-brand-teal mt-0.5 flex-shrink-0" />
                <p className="text-sm text-brand-navy line-clamp-2 font-light">
                  {post.suggested_comment}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;