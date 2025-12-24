import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast, Button, Flex, FormControl, FormLabel, Input, FormErrorMessage, Text, useColorModeValue, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthCard from "../../components/ui/AuthCard";
import authService from "../../services/authService";
import { forgotPasswordSchema } from "../../utils/validationSchemas";
import useLanguageSwitcher from "../../hooks/useLanguageSwitcher";
import ThemeToggle from "../../components/ui/ThemeToggle";

const ForgotPasswordPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { switchLanguage, isArabic } = useLanguageSwitcher();

  const resolver = useMemo(() => yupResolver(forgotPasswordSchema(i18n)), [i18n]);

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data);

      toast({
        title: t("forgotPassword.emailSentTitle"),
        description: t("forgotPassword.emailSentDescription"),
        status: "success",
        duration: 7000,
        isClosable: true,
      });

      reset();
    } catch (error) {
      toast({
        title: t("forgotPassword.errorTitle"),
        description: error.response?.data?.message || t("somethingWrong"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Color mode values
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const linkColor = useColorModeValue("#2f855a", "green.300");

  return (
    <AuthCard title={t("forgotPassword.title")} subtitle={t("forgotPassword.subtitle")}>
      <Flex justify="flex-end" mb={4}>
        <HStack spacing={2}>
          <ThemeToggle />
          <Button size="sm" variant="outline" onClick={switchLanguage}>
            {isArabic ? "English" : "العربية"}
          </Button>
        </HStack>
      </Flex>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={4}>
          <FormControl isInvalid={errors.email}>
            <FormLabel fontSize="sm">{t("email")}</FormLabel>
            <Input
              placeholder={t("emailPlaceholder")}
              bg={inputBg}
              type="email"
              {...formRegister("email")}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            mt={2}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {t("forgotPassword.sendResetLink")}
          </Button>

          <Text fontSize="sm" textAlign="center" mt={2}>
            {t("forgotPassword.rememberPassword")} {" "}
            <Link to="/login" style={{ color: linkColor, fontWeight: "500" }}>
              {t("forgotPassword.backToLogin")}
            </Link>
          </Text>
        </Flex>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
