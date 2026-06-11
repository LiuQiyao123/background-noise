import { useState } from 'react';

interface UserAvatarProps {
  nickname: string;
  avatarUrl: string | null | undefined;
  size?: number;
}

const avatarColors = [
  '#e85d4c', '#c9a227', '#6b8cae', '#9b6b9e',
  '#4ade80', '#fbbf24', '#ef4444', '#7a7585',
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function UserAvatar({ nickname, avatarUrl, size = 40 }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = nickname?.charAt(0) ?? '?';
  const bgColor = hashColor(nickname ?? '?');

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={nickname}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 600,
        fontSize: size * 0.42,
        color: '#fff',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {initial}
    </div>
  );
}
