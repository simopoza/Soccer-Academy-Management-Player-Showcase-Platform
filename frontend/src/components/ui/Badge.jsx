import { Badge as ChakraBadge } from '@chakra-ui/react';

const Badge = ({ children, variant = 'default', ...props }) => {
  const variantStyles = {
    success: {
      bg: 'green.50',
      color: 'green.600',
      borderColor: 'green.200',
    },
    warning: {
      bg: 'orange.50',
      color: 'orange.600',
      borderColor: 'orange.200',
    },
    danger: {
      bg: 'red.50',
      color: 'red.600',
      borderColor: 'red.200',
    },
    info: {
      bg: 'blue.50',
      color: 'blue.600',
      borderColor: 'blue.200',
    },
    default: {
      bg: 'gray.50',
      color: 'gray.600',
      borderColor: 'gray.200',
    },
  };

  return (
    <ChakraBadge
      px={2.5}
      py={0.5}
      borderRadius="full"
      fontSize="xs"
      fontWeight="500"
      border="1px"
      {...variantStyles[variant]}
      {...props}
    >
      {children}
    </ChakraBadge>
  );
};

export default Badge;
