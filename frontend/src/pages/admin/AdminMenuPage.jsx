import { Box, Container, Heading, Text, SimpleGrid, Card, CardHeader, CardBody, Button, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDashboardTheme } from "../../hooks/useDashboardTheme";
import Layout from "../../components/layout/Layout";

const AdminMenuPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const { bgGradient } = useDashboardTheme();
  // Color mode values
  const headingColor = useColorModeValue("green.700", "green.300");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.700");

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
    <Layout pageTitle={t("adminDashboard") || "Admin Dashboard"}>
      <Box minH="100vh" bgGradient={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
        <Container maxW="container.xl">
          {/* Header */}
          <Heading size="xl" color={headingColor} mb={2}>
            {t("adminMenu") || "Admin Menu"}
          </Heading>
          <Text color={textColor} fontSize="lg" mb={8}>
            {t("welcomeAdmin") || "Welcome! Manage your soccer academy from here."}
          </Text>

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
                  <Text fontSize="4xl">{card.icon}</Text>
                  <Heading size="md" color="white" mt={2}>
                    {card.title}
                  </Heading>
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
    </Layout>
  );
};

export default AdminMenuPage;
