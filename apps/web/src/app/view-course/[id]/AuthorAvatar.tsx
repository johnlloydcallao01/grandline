'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Media {
  id: string;
  url?: string;
  cloudinaryURL?: string;
  thumbnailURL?: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  profilePicture?: Media | null;
}

function getImageUrl(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.cloudinaryURL || media.url || media.thumbnailURL || null;
}

export function AuthorAvatar({ user }: { user: User }) {
  const [imageError, setImageError] = useState(false);
  const profilePictureUrl = getImageUrl(user.profilePicture);
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  // If no profile picture URL or image failed to load, show initials
  if (!profilePictureUrl || imageError) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {initials}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
      {React.createElement(Image, {
        src: profilePictureUrl,
        alt: `${fullName}'s profile picture`,
        width: 40,
        height: 40,
        className: "w-full h-full object-cover",
        onError: () => setImageError(true)
      })}
    </div>
  );
}