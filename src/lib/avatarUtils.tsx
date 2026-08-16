import React from 'react';
import {
  User,
  Target,
  Zap,
  Rocket,
  Brain,
  Gamepad2,
  Coffee,
  Music,
  Star,
  Crown,
  Shield,
  Flame,
} from 'lucide-react';
import { UserProfile } from '../types';

export const AVATAR_ICONS = [
  { name: 'User', Icon: User },
  { name: 'Target', Icon: Target },
  { name: 'Zap', Icon: Zap },
  { name: 'Rocket', Icon: Rocket },
  { name: 'Brain', Icon: Brain },
  { name: 'Gamepad2', Icon: Gamepad2 },
  { name: 'Coffee', Icon: Coffee },
  { name: 'Music', Icon: Music },
  { name: 'Star', Icon: Star },
  { name: 'Crown', Icon: Crown },
  { name: 'Shield', Icon: Shield },
  { name: 'Flame', Icon: Flame },
];

interface AvatarDisplayProps {
  userProfile: UserProfile;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  userProfile,
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-16 h-16',
  };

  const iconSizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-8 h-8',
  };

  const avatarType = userProfile.avatarType || 'icon';
  const avatar = userProfile.avatar;

  if (avatarType === 'upload') {
    return (
      <img
        src={avatar}
        alt={userProfile.name}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  } else {
    const IconComponent = AVATAR_ICONS.find((i) => i.name === avatar)?.Icon || User;
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center ${className}`}>
        <IconComponent className={`${iconSizeClasses[size]} text-blue-400`} />
      </div>
    );
  }
};

export const getAvatarIcon = (iconName: string) => {
  return AVATAR_ICONS.find((i) => i.name === iconName)?.Icon || User;
};
