import Image from 'next/image';

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

interface CommentListProps {
  comments: Comment[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <div className="flex items-center gap-3 mb-2">
            {comment.user.image ? (
              <Image
                src={comment.user.image}
                alt={comment.user.name || 'User'}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                {comment.user.name?.[0]?.toUpperCase() || comment.user.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {comment.user.name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </p>
            </div>
          </div>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        </div>
      ))}
    </div>
  );
}
