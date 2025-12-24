import { Box, Container, Card, CardHeader, CardBody, Heading, Text, SimpleGrid, useColorModeValue, Skeleton, SkeletonCircle, VStack, HStack } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import Layout from "../layout/Layout";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

const SettingsPage = ({ user }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isLoading = !user;

  const bgGradient = useColorModeValue("white", "linear(to-b, gray.900, gray.800)");
  const cardBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("green.700", "green.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  // Derive loading state from `user` prop; initialize accordingly

  if (isLoading) {
    return (
      <Layout pageTitle={t("settings") || "Settings"} pageSubtitle={t("manageAccount") || "Manage your account settings"}>
        <Box minH="100vh" bg={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
          <Container maxW="container.xl">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card bg={cardBg} boxShadow="lg">
                <CardHeader>
                  <Skeleton height="24px" width="60%" mb={2} />
                  <Skeleton height="16px" width="80%" />
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <SkeletonCircle size="20" />
                      <VStack align="start" spacing={2} flex={1}>
                        <Skeleton height="20px" width="60%" />
                        <Skeleton height="14px" width="40%" />
                        <Skeleton height="14px" width="50%" />
                      </VStack>
                    </HStack>
                    <Skeleton height="1px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" mt={2} />
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} boxShadow="lg">
                <CardHeader>
                  <Skeleton height="24px" width="60%" mb={2} />
                  <Skeleton height="16px" width="80%" />
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" />
                    <Skeleton height="40px" mt="auto" />
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Container>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={t("settings") || "Settings"} pageSubtitle={t("manageAccount") || "Manage your account settings"}>
      <Box minH="100vh" bg={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card bg={cardBg} boxShadow="lg" display="flex" flexDirection="column">
              <CardHeader>
                <Heading size="md" color={headingColor}>
                  {t("profileInformation") || "Profile Information"}
                </Heading>
                <Text color={textColor} fontSize="sm" mt={1}>
                  {t("updateProfileInfo") || "Update your account profile information"}
                </Text>
              </CardHeader>
              <CardBody flex="1" display="flex" flexDirection="column">
                <ProfileForm user={user} />
              </CardBody>
            </Card>

            <Card bg={cardBg} boxShadow="lg" display="flex" flexDirection="column">
              <CardHeader>
                <Heading size="md" color={headingColor}>
                  {t("changePassword") || "Change Password"}
                </Heading>
                <Text color={textColor} fontSize="sm" mt={1}>
                  {t("updatePassword") || "Update your password to keep your account secure"}
                </Text>
              </CardHeader>
              <CardBody display="flex" flexDirection="column" flex="1">
                <PasswordForm user={user} />
              </CardBody>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>
    </Layout>
  );
};

export default SettingsPage;
