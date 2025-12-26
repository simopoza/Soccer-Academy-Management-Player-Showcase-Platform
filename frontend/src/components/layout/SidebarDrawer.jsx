import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Divider,
  Button,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FiHome,
  FiUsers,
  FiCalendar,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiUser,
  FiFileText,
  FiGlobe,
  FiMoon,
  FiSun,
  FiGrid
} from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../ui/ThemeToggle";
import useLanguageSwitcher from "../../hooks/useLanguageSwitcher";

const SidebarDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { switchLanguage, isArabic } = useLanguageSwitcher();
  const isRTL = i18n.language === "ar";

  // Color mode values - Design System
  const sidebarBg = useColorModeValue("#FFFFFF", "gray.800");
  const activeBg = useColorModeValue("#00B050", "#00B050");
  const activeColor = useColorModeValue("#FFFFFF", "#FFFFFF");
  const hoverBg = useColorModeValue("#F9FAFB", "gray.700");
  const textColor = useColorModeValue("#111827", "gray.200");
  const mutedText = useColorModeValue("#6B7280", "gray.400");
  const primaryGreen = "#00B050";

  // Navigation items based on role
  const getNavigationItems = () => {
    if (!user?.role) return [];

    switch (user.role) {
      case "admin":
        return [
          { label: t("dashboard"), path: "/admin/dashboard", icon: FiHome },
          { label: t("users"), path: "/admin/users-management", icon: FiUsers },
          { label: t("players"), path: "/admin/players-management", icon: FiUsers },
          { label: t("teams"), path: "/admin/teams-management", icon: HiOutlineUserGroup },
          { label: t("matches"), path: "/admin/matches-management", icon: FiCalendar },
          // menu and analytics removed — use dashboard and stats pages instead
        ];
      case "player":
        return [
          { label: t("dashboard"), path: "/player-dashboard", icon: FiHome },
          { label: t("myProfile"), path: "/profile", icon: FiUser },
          { label: t("myStats"), path: "/stats", icon: FiBarChart2 },
          { label: t("myTeam"), path: "/team", icon: HiOutlineUserGroup },
          { label: t("settings"), path: "/settings", icon: FiSettings },
        ];
      case "agent":
        return [
          { label: t("dashboard"), path: "/agent-dashboard", icon: FiHome },
          { label: t("myPlayers"), path: "/my-players", icon: FiUsers },
          { label: t("contracts"), path: "/contracts", icon: FiFileText },
          { label: t("settings"), path: "/settings", icon: FiSettings },
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
      <DrawerContent bg={sidebarBg} maxW="260px">
        <DrawerCloseButton />
        <DrawerBody p={0}>
          <Flex direction="column" h="100vh">
            {/* Academy Logo & Role Section */}
            {/* Sidebar Header Section - Figma-like exact spacing */}
            <VStack align="stretch" spacing={0} pt="24px" px="20px">
              <Box display="flex" alignItems="center" gap={3}>
                <Box
                  w="14"
                  h="14"
                  bgGradient="linear(to-br, green.400, green.600)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="lg"
                  flexShrink={0}
                >
                  <Text fontSize="3xl">⚽</Text>
                </Box>
                <Box>
                  <Text
                    fontSize="lg"
                    fontWeight="600"
                    color={primaryGreen}
                    lineHeight="1.2"
                  >
                    {t("soccerAcademy")}
                  </Text>
                  <Text
                    fontSize="xs"
                    fontWeight="500"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={mutedText}
                    mt="4px"
                    mb="16px"
                  >
                    {user?.role?.toUpperCase()} Portal
                  </Text>
                </Box>
              </Box>
              <Divider mb="16px" />
            </VStack>

            {/* Navigation Menu */}
            <VStack spacing={2} align="stretch" px={5} py={6}>
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
                    h="44px"
                    dir={isRTL ? "rtl" : "ltr"}
                    leftIcon={<Icon as={item.icon} boxSize={5} />}
                    fontWeight="500"
                    fontSize="sm"
                  >
                    {item.label}
                  </Button>
                );
              })}
            </VStack>

            {/* Spacer to push bottom controls down */}
            <Box flex="1" />

            <Divider mt={8} />

            {/* Bottom Controls */}
            <VStack spacing={1} align="stretch" px={5} py={3}>
              {/* Theme Toggle */}
              <Flex
                justify="space-between"
                align="center"
                w="100%"
                px={3}
                h="44px"
                borderRadius="md"
                _hover={{ bg: hoverBg }}
                cursor="pointer"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <HStack spacing={3}>
                  <Icon as={FiMoon} boxSize={5} color={textColor} />
                  <Text fontSize="sm" fontWeight="500" color={textColor}>
                    {t("theme")}
                  </Text>
                </HStack>
                <ThemeToggle />
              </Flex>

              {/* Language Toggle */}
              <Button
                variant="ghost"
                justifyContent="flex-start"
                w="100%"
                h="44px"
                _hover={{ bg: hoverBg }}
                onClick={switchLanguage}
                dir={isRTL ? "rtl" : "ltr"}
                leftIcon={<Icon as={FiGlobe} boxSize={5} />}
                fontWeight="500"
                fontSize="sm"
              >
                <Flex justify="space-between" align="center" w="100%">
                  <Text fontSize="sm" color={textColor}>
                    {t("language")}
                  </Text>
                  <Text fontSize="sm" fontWeight="600">
                    {isArabic ? "EN" : "AR"}
                  </Text>
                </Flex>
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                justifyContent="flex-start"
                w="100%"
                h="44px"
                color="#E11D48"
                _hover={{ bg: useColorModeValue("#FEE2E2", "red.900") }}
                onClick={handleLogout}
                dir={isRTL ? "rtl" : "ltr"}
                leftIcon={<Icon as={FiLogOut} boxSize={5} />}
                fontWeight="500"
                fontSize="sm"
              >
                {t("logout")}
              </Button>
            </VStack>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default SidebarDrawer;
