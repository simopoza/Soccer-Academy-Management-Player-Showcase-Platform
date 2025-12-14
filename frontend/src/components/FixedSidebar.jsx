import {
  Box,
  Flex,
  VStack,
  Text,
  Divider,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

const FixedSidebar = () => {
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
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = getNavigationItems();

  return (
    <Box
      position="fixed"
      left={isRTL ? "auto" : 0}
      right={isRTL ? 0 : "auto"}
      top={0}
      h="100vh"
      w="280px"
      bg={sidebarBg}
      borderRight={!isRTL ? "1px" : "none"}
      borderLeft={isRTL ? "1px" : "none"}
      borderColor={borderColor}
      overflowY="auto"
      display={{ base: "none", lg: "block" }}
    >
      <Flex direction="column" h="100%">
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
          <Button
            variant="ghost"
            justifyContent="space-between"
            w="100%"
            _hover={{ bg: hoverBg }}
            dir={isRTL ? "rtl" : "ltr"}
            rightIcon={<ThemeToggle />}
          >
            <Text fontSize="sm" color={textColor}>
              {t("theme")}
            </Text>
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            justifyContent="space-between"
            w="100%"
            _hover={{ bg: hoverBg }}
            onClick={switchLanguage}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <Text fontSize="sm" color={textColor}>
              {t("language")}
            </Text>
            <Text fontSize="sm" fontWeight="bold">
              {isArabic ? "EN" : "AR"}
            </Text>
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
          >
            {t("logout")}
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
};

export default FixedSidebar;
