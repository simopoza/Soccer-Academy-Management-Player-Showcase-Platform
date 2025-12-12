import { Box, Container, Heading, Text, Card, CardBody, Stack, Button, Flex, useToast, HStack, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

const PlayerDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="container.xl">
        {/* Header Controls */}
        <Flex justify="flex-end" mb={4}>
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

        <Card bg={cardBg} boxShadow="lg" borderRadius="lg" p={8}>
          <CardBody>
            <Stack spacing={4} align="center" textAlign="center" py={12}>
              <Text fontSize="6xl">⚽</Text>
              <Heading size="xl" color={headingColor}>
                {t("welcomePlayer") || "Welcome to Player Dashboard"}
              </Heading>
              <Text color={textColor} fontSize="lg">
                {t("playerDashboardDesc") || `Hello ${user?.first_name || "Player"}! Your dashboard is coming soon...`}
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default PlayerDashboardPage;
