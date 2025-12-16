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
  MdDashboard, 
  MdPeople, 
  MdSportsSoccer, 
  MdGroups, 
  MdSportsScore, 
  MdAnalytics,
  MdPerson,
  MdBarChart,
  MdSettings,
  MdDescription,
  MdLogout,
  MdLanguage,
  MdDarkMode,
  MdLightMode,
  MdApps
} from "react-icons/md";
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
          { label: t("dashboard"), path: "/admin/dashboard", icon: MdDashboard },
          { label: t("menu"), path: "/admin/menu", icon: MdApps },
          { label: t("users"), path: "/admin/users", icon: MdPeople },
          { label: t("players"), path: "/admin/players", icon: MdSportsSoccer },
          { label: t("teams"), path: "/admin/teams", icon: MdGroups },
          { label: t("matches"), path: "/admin/matches", icon: MdSportsScore },
          { label: t("analytics"), path: "/admin/analytics", icon: MdAnalytics },
        ];
      case "player":
        return [
          { label: t("dashboard"), path: "/player-dashboard", icon: MdDashboard },
          { label: t("myProfile"), path: "/profile", icon: MdPerson },
          { label: t("myStats"), path: "/stats", icon: MdBarChart },
          { label: t("myTeam"), path: "/team", icon: MdGroups },
          { label: t("settings"), path: "/settings", icon: MdSettings },
        ];
      case "agent":
        return [
          { label: t("dashboard"), path: "/agent-dashboard", icon: MdDashboard },
          { label: t("myPlayers"), path: "/my-players", icon: MdSportsSoccer },
          { label: t("contracts"), path: "/contracts", icon: MdDescription },
          { label: t("settings"), path: "/settings", icon: MdSettings },
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
          <Flex direction="column" h="100vh">
            {/* Academy Logo & Role Section */}
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
              <Flex align="center" gap={4}>
                <Box
                  w="12"
                  h="12"
                  bgGradient="linear(to-br, green.400, green.600)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="lg"
                  flexShrink={0}
                >
                  <Text fontSize="2xl">⚽</Text>
                </Box>
                <Box>
                  <Text fontSize="md" fontWeight="bold" color={textColor} lineHeight="1.2">
                    {t("soccerAcademy")}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {user?.role?.toUpperCase()} Portal
                  </Text>
                </Box>
              </Flex>
            </Box>

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
                    leftIcon={<Icon as={item.icon} boxSize={5} />}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </VStack>

            {/* Spacer to push bottom controls down */}
            <Box flex="1" />

            <Divider />

            {/* Bottom Controls */}
            <VStack spacing={1} align="stretch" p={4}>
              {/* Theme Toggle */}
              <Flex
                justify="space-between"
                align="center"
                w="100%"
                px={4}
                py={2}
                borderRadius="md"
                _hover={{ bg: hoverBg }}
                cursor="pointer"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <HStack spacing={3}>
                  <Icon as={MdDarkMode} boxSize={5} color={textColor} />
                  <Text fontSize="sm" color={textColor}>
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
                _hover={{ bg: hoverBg }}
                onClick={switchLanguage}
                dir={isRTL ? "rtl" : "ltr"}
                leftIcon={<Icon as={MdLanguage} boxSize={5} />}
              >
                <Flex justify="space-between" align="center" w="100%">
                  <Text fontSize="sm" color={textColor}>
                    {t("language")}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {isArabic ? "EN" : "AR"}
                  </Text>
                </Flex>
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                justifyContent="flex-start"
                w="100%"
                color="red.500"
                _hover={{ bg: useColorModeValue("red.50", "red.900") }}
                onClick={handleLogout}
                dir={isRTL ? "rtl" : "ltr"}
                leftIcon={<Icon as={MdLogout} boxSize={5} />}
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
