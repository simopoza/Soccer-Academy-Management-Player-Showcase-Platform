import React from "react";
import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AgentMenuPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box py={8} px={4}>
      <Container maxW="container.md">
        <VStack spacing={6} align="stretch">
          <Heading>{t("agentMenu") || "Agent Menu"}</Heading>
          <Text color="gray.600">{t("agentMenuSubtitle") || "Manage your assigned players and settings from here."}</Text>

          <Button onClick={() => navigate("/agent/profile")}>{t("viewProfile") || "View Profile"}</Button>
          <Button onClick={() => navigate("/agent/settings")}>{t("settings") || "Settings"}</Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default AgentMenuPage;
