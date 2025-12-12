import { Box, Container, Heading, Text, SimpleGrid, Card, CardHeader, CardBody, Button, Icon, Stack, Flex, useToast, HStack, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const toast = useToast();
  const { switchLanguage, isArabic } = useLanguageSwitcher();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isRTL = i18n.language === "ar";

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-b, green.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );
  const headingColor = useColorModeValue("green.700", "green.300");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.700");
  const langBtnColor = useColorModeValue("gray.800", "white");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: t("logoutSuccess") || "Logged out successfully",
        description: t("logoutMessage") || "You have been logged out. See you soon!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: t("logoutError") || "Logout failed",
        description: t("somethingWrong") || "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const dashboardCards = [
    {
      title: t("userManagement") || "User Management",
      description: t("manageUsersDesc") || "Approve or reject pending user registrations",
      icon: "👥",
      path: "/admin/users",
      color: "green",
    },
    {
      title: t("playersManagement") || "Players Management",
      description: t("playersManagementDesc") || "Manage player profiles and information",
      icon: "⚽",
      path: "/admin/players",
      color: "blue",
      disabled: true,
    },
    {
      title: t("teamsManagement") || "Teams Management",
      description: t("teamsManagementDesc") || "Manage teams and their information",
      icon: "🏆",
      path: "/admin/teams",
      color: "purple",
      disabled: true,
    },
    {
      title: t("matchesManagement") || "Matches Management",
      description: t("matchesManagementDesc") || "Schedule and manage matches",
      icon: "📅",
      path: "/admin/matches",
      color: "orange",
      disabled: true,
    },
    {
      title: t("analyticsReports") || "Analytics & Reports",
      description: t("analyticsReportsDesc") || "View performance analytics and detailed reports",
      icon: "📊",
      path: "/admin/analytics",
      color: "teal",
      // disabled: true,
    },
  ];

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="container.xl">
        {/* Header with Logout Button */}
        <Flex justify="space-between" align="center" mb={8}>
          <Stack spacing={2}>
            <Heading size="xl" color={headingColor}>
              ⚽ {t("adminDashboard") || "Admin Dashboard"}
            </Heading>
            <Text color={textColor} fontSize="lg">
              {t("welcomeAdmin") || "Welcome! Manage your soccer academy from here."}
            </Text>
          </Stack>
          <HStack spacing={2}>
            <ThemeToggle />
            <Button
              size="md"
              variant="outline"
              color={langBtnColor}
              onClick={switchLanguage}
            >
              {isArabic ? "English" : "العربية"}
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleLogout}
              isLoading={isLoggingOut}
              loadingText={t("loggingOut") || "Logging out..."}
            >
              {t("logout") || "Logout"}
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
              bg={cardBg}
              boxShadow="lg"
              borderRadius="lg"
              overflow="hidden"
              _hover={{ transform: card.disabled ? "none" : "translateY(-4px)", boxShadow: "xl" }}
              transition="all 0.3s"
              opacity={card.disabled ? 0.6 : 1}
              cursor={card.disabled ? "not-allowed" : "pointer"}
              onClick={() => !card.disabled && navigate(card.path)}
            >
              <CardHeader bg={`${card.color}.500`} py={6}>
                <Stack spacing={2}>
                  <Text fontSize="4xl">{card.icon}</Text>
                  <Heading size="md" color="white">
                    {card.title}
                  </Heading>
                </Stack>
              </CardHeader>
              <CardBody>
                <Text color={textColor} mb={4}>
                  {card.description}
                </Text>
                <Button
                  colorScheme={card.color}
                  size="sm"
                  isDisabled={card.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    !card.disabled && navigate(card.path);
                  }}
                >
                  {card.disabled ? (t("comingSoon") || "Coming Soon") : (t("manage") || "Manage")}
                </Button>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
