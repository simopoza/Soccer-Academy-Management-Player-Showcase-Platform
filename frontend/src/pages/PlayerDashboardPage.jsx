import { Box, Container, Heading, Text, Card, CardBody, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const PlayerDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === "ar";

  return (
    <Box minH="100vh" bgGradient="linear(to-b, green.50, white)" py={8} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="container.xl">
        <Card boxShadow="lg" borderRadius="lg" p={8}>
          <CardBody>
            <Stack spacing={4} align="center" textAlign="center" py={12}>
              <Text fontSize="6xl">⚽</Text>
              <Heading size="xl" color="green.700">
                {t("welcomePlayer") || "Welcome to Player Dashboard"}
              </Heading>
              <Text color="gray.600" fontSize="lg">
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
