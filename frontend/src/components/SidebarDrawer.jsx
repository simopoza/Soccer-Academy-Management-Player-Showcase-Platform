import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Divider,
  Button,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

const SidebarDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { switchLanguage, isArabic } = useLanguageSwitcher();
  const isRTL = i18n.language === "ar";

  // Color mode values
  const sidebarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeBg = useColorModeValue("green.50", "green.900");
  const activeColor = useColorModeValue("green.600", "green.200");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Navigation items based on role
  const getNavigationItems = () => {
    if (!user?.role) return [];

    switch (user.role) {
      case "admin":
        return [
          { label: t("dashboard"), path: "/admin-dashboard" },
          { label: t("users"), path: "/users" },
          { label: t("players"), path: "/players" },
          { label: t("teams"), path: "/teams" },
          { label: t("matches"), path: "/matches" },
          { label: t("analytics"), path: "/analytics" },
        ];
      case "player":
        return [
          { label: t("dashboard"), path: "/player-dashboard" },
          { label: t("myProfile"), path: "/profile" },
          { label: t("myStats"), path: "/stats" },
          { label: t("myTeam"), path: "/team" },
          { label: t("settings"), path: "/settings" },
        ];
      case "agent":
        return [
          { label: t("dashboard"), path: "/agent-dashboard" },
          { label: t("myPlayers"), path: "/my-players" },
          { label: t("contracts"), path: "/contracts" },
          { label: t("settings"), path: "/settings" },
        ];
      default:
        return [];
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const navigationItems = getNavigationItems();

  return (
    <Drawer
      isOpen={isOpen}
      placement={isRTL ? "right" : "left"}
      onClose={onClose}
      size="xs"
    >
      <DrawerOverlay />
      <DrawerContent bg={sidebarBg}>
        <DrawerCloseButton />
        <DrawerBody p={0}>
          <Box h="100vh" overflowY="auto">
            {/* Logo Section */}
            <Flex h="70px" align="center" justify="center" borderBottom="1px" borderColor={borderColor}>
              <Text fontSize="xl" fontWeight="bold" color="green.500">
                {t("soccerAcademy")}
              </Text>
            </Flex>

            {/* User Profile Section */}
            <Box p={6}>
              <Flex align="center" gap={3}>
                <Avatar
                  size="lg"
                  name={`${user?.first_name} ${user?.last_name}`}
                  bg="green.500"
                  color="white"
                />
                <Box>
                  <Text fontWeight="bold" color={textColor}>
                    {user?.first_name} {user?.last_name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {user?.role?.toUpperCase()}
                  </Text>
                </Box>
              </Flex>
            </Box>

            <Divider />

            {/* Navigation Menu */}
            <VStack spacing={1} align="stretch" p={4}>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    justifyContent="flex-start"
                    bg={isActive ? activeBg : "transparent"}
                    color={isActive ? activeColor : textColor}
                    _hover={{ bg: isActive ? activeBg : hoverBg }}
                    onClick={() => handleNavigation(item.path)}
                    w="100%"
                    dir={isRTL ? "rtl" : "ltr"}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </VStack>

            <Divider />

            {/* Bottom Controls */}
            <VStack spacing={4} p={4} mt="auto">
              {/* Theme Toggle */}
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color={textColor}>
                  {t("theme")}
                </Text>
                <ThemeToggle />
              </HStack>

              {/* Language Toggle */}
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" color={textColor}>
                  {t("language")}
                </Text>
                <Tooltip label={isArabic ? "English" : "العربية"}>
                  <Button size="sm" onClick={switchLanguage} variant="outline">
                    {isArabic ? "EN" : "AR"}
                  </Button>
                </Tooltip>
              </HStack>

              {/* Logout Button */}
              <Button
                colorScheme="red"
                variant="outline"
                w="100%"
                onClick={handleLogout}
              >
                {t("logout")}
              </Button>
            </VStack>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default SidebarDrawer;
