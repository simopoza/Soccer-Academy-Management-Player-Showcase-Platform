import React from "react";
import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AgentProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box py={8} px={4}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Heading>{t("agentProfile") || "Agent Profile"}</Heading>
          <Text color="gray.600">{t("agentProfileSubtitle") || "View and edit your agent profile."}</Text>

          <VStack align="start" spacing={2} pt={4}>
            <Text><strong>{t("name") || "Name"}:</strong> {user?.first_name} {user?.last_name}</Text>
            <Text><strong>{t("email") || "Email"}:</strong> {user?.email}</Text>
          </VStack>

          <Button onClick={() => navigate("/agent/settings")}>{t("editProfile") || "Edit Profile"}</Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default AgentProfilePage;
