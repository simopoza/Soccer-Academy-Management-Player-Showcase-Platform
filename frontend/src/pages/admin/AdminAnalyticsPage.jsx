import { Box, Container, Heading, Text, Stack, Card, CardBody } from "@chakra-ui/react";
import { useDashboardTheme } from "../../hooks/useDashboardTheme";
import { useTranslation } from "react-i18next";

const AdminAnalyticsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { bgGradient } = useDashboardTheme();

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="container.xl">
        <Card boxShadow="lg" borderRadius="lg" p={8}>
          <CardBody>
            <Stack spacing={4} align="center" textAlign="center" py={12}>
              <Text fontSize="6xl">📊</Text>
              <Heading size="xl" color="green.700">
                {t("welcomeToAnalytics") || "Welcome to Analytics Page"}
              </Heading>
              <Text color="gray.600" fontSize="lg">
                {t("analyticsComingSoon") || "Analytics and reports dashboard coming soon..."}
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminAnalyticsPage;
