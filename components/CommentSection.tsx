'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { CommentEditor } from './CommentEditor';
import { CommentList } from './CommentList';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email?: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const isLoggedIn = status === 'authenticated';

  function handleCommentAdded(comment: Comment) {
    setComments([comment, ...comments]);
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {isLoggedIn ? (
        <div className="mb-8">
          <CommentEditor postId={postId} onCommentAdded={handleCommentAdded} />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Sign in to leave a comment
          </p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      )}

      {/* Comment List */}
      <CommentList comments={comments} />
    </div>
  );
}
