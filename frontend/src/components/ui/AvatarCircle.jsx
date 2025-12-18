import { Avatar, AvatarBadge } from '@chakra-ui/react';

const AvatarCircle = ({ 
  name, 
  src, 
  size = 'md', 
  initials,
  bg = 'green.50',
  color = 'green.600',
  ...props 
}) => {
  // Generate initials from name if not provided
  const getInitials = () => {
    if (initials) return initials;
    if (!name) return '?';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Avatar
      name={name}
      src={src}
      size={size}
      bg={bg}
      color={color}
      fontWeight="600"
      fontSize={size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'md'}
      {...props}
    >
      {!src && getInitials()}
    </Avatar>
  );
};

export default AvatarCircle;
