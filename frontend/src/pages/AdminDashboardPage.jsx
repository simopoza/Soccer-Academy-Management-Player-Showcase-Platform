import { Box, Container, Heading, Text, SimpleGrid, Card, CardHeader, CardBody, Button, Icon, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

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
    <Box minH="100vh" bgGradient="linear(to-b, green.50, white)" py={8} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="container.xl">
        <Stack spacing={6} mb={8}>
          <Heading size="xl" color="green.700">
            ⚽ {t("adminDashboard") || "Admin Dashboard"}
          </Heading>
          <Text color="gray.600" fontSize="lg">
            {t("welcomeAdmin") || "Welcome! Manage your soccer academy from here."}
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
          {dashboardCards.map((card, index) => (
            <Card
              key={index}
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
                <Text color="gray.600" mb={4}>
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
