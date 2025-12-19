import { Badge as ChakraBadge } from '@chakra-ui/react';

const Badge = ({ children, variant = 'default', ...props }) => {
  const variantStyles = {
    success: {
      bg: '#DCFCE7',
      color: '#166534',
    },
    danger: {
      bg: '#FEE2E2',
      color: '#991B1B',
    },
    warning: {
      bg: '#FEF3C7',
      color: '#92400E',
    },
    info: {
      bg: '#DBEAFE',
      color: '#1E40AF',
    },
    default: {
      bg: '#F1F5F9',
      color: '#475569',
    },
  };

  return (
    <ChakraBadge
      px="10px"
      py="4px"
      borderRadius="full"
      fontSize="12px"
      fontWeight="500"
      {...variantStyles[variant]}
      {...props}
    >
      {children}
    </ChakraBadge>
  );
};

export default Badge;
