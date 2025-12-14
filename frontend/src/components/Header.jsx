import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Avatar,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SidebarDrawer from "./SidebarDrawer";

const Header = ({ pageTitle, pageSubtitle }) => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isRTL = i18n.language === "ar";

  // Color mode values
  const headerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const titleColor = useColorModeValue("green.700", "green.300");
  const subtitleColor = useColorModeValue("gray.600", "gray.400");

  return (
    <>
      {/* Fixed Header */}
      <Box
        position="sticky"
        top={0}
        zIndex={999}
        bg={headerBg}
        borderBottom="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <Flex
          h="80px"
          px={4}
          align="center"
          justify="space-between"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Left Side (EN) / Right Side (AR) */}
          <HStack spacing={4}>
            {/* Hamburger Button - only visible on mobile */}
            <IconButton
              icon={<HamburgerIcon />}
              onClick={onOpen}
              aria-label="Open menu"
              variant="ghost"
              size="lg"
              display={{ base: "flex", lg: "none" }}
              _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
            />

            {/* Page Title and Subtitle */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" color={titleColor}>
                {pageTitle}
              </Text>
              <Text fontSize="sm" color={subtitleColor}>
                {pageSubtitle || `Welcome back, ${user?.first_name} ${user?.last_name}`}
              </Text>
            </Box>
          </HStack>

          {/* Right Side (EN) / Left Side (AR) */}
          <Avatar
            size="md"
            name={`${user?.first_name} ${user?.last_name}`}
            bg="green.500"
            color="white"
            cursor="pointer"
            onClick={() => navigate("/profile")}
            _hover={{ opacity: 0.8 }}
          />
        </Flex>
      </Box>

      {/* Sidebar Drawer - only for mobile */}
      <SidebarDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default Header;
