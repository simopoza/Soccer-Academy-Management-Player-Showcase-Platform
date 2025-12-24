import { IconButton, useColorMode, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const ThemeToggle = ({ size = "md", variant = "ghost" }) => {
  const { toggleColorMode } = useColorMode();
  const icon = useColorModeValue(<MoonIcon />, <SunIcon />);
  const label = useColorModeValue("Switch to dark mode", "Switch to light mode");
  
  return (
    <Tooltip label={label} placement="bottom">
      <IconButton
        icon={icon}
        onClick={toggleColorMode}
        variant={variant}
        size={size}
        aria-label={label}
        _hover={{
          transform: 'rotate(20deg)',
          transition: 'transform 0.3s ease',
        }}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
