import React from 'react';

const AvatarGroup = ({ users = [], maxVisible = 3 }) => {
  // Ensure users is an array and has items
  if (!users || !Array.isArray(users) || users.length === 0) {
    return null; // or return a default avatar
  }

  // Handle both string URLs and user objects with avatarUrl or image property
  const getAvatarUrl = (user) => {
    if (typeof user === 'string') return user;
    return user.avatarUrl || user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random`;
  };

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => (
        <img
          key={index}
          src={getAvatarUrl(user)}
          alt={typeof user === 'object' ? user.name || `User ${index + 1}` : `Avatar ${index + 1}`}
          className="w-9 h-9 rounded-full border-2 border-white -ml-3 first:ml-0 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${typeof user === 'object' ? encodeURIComponent(user.name || 'U') : 'U'}&background=random`;
          }}
        />
      ))}

      {remainingCount > 0 && (
        <div className="w-9 h-9 flex items-center justify-center bg-blue-50 text-sm rounded-full border-2 border-white -ml-3 text-blue-600 font-medium">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default AvatarGroup;
