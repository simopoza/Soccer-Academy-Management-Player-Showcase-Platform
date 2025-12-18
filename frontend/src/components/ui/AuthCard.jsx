import { Box, Flex, Circle, Text, Stack, useColorModeValue } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const AuthCard = ({ title, subtitle, children, maxWidth = "500px" }) => {
  const { i18n } = useTranslation();

  // Check if current lang is RTL
  const isRTL = i18n.language === "ar";

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.700");
  const subtitleColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      p={4}
      direction="column"
    >
      <Box
        w={maxWidth}
        bg={cardBg}
        borderRadius="lg"
        boxShadow="lg"
        p={8}
        textAlign="center"
        dir={isRTL ? "rtl" : "ltr"}   // switch direction
      >
        {/* Logo */}
        <Circle size="60px" bg="green.500" mx="auto" mb={4}>
          <Text fontSize="2xl" color="white">⚽</Text>
        </Circle>

        {/* Title + Subtitle */}
        <Stack spacing={1} mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="sm" color={subtitleColor}>
            {subtitle}
          </Text>
        </Stack>

        {/* Form */}
        {children}
      </Box>
    </Flex>
  );
};

export default AuthCard;
