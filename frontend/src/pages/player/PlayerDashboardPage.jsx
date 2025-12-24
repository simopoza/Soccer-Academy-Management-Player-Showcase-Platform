import { Box, Container, Heading, Text, Card, CardBody, Stack, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/layout/Layout";

const PlayerDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === "ar";

  // Color mode values
  
  const headingColor = useColorModeValue("green.700", "green.300");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Layout pageTitle={t("playerDashboard") || "Player Dashboard"}>
      <Box minH="100vh" bgGradient="linear(to-b, green.50, white)" py={8} dir={isRTL ? "rtl" : "ltr"}>
        <Container maxW="container.xl">
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
    </Layout>
  );
};

export default PlayerDashboardPage;
