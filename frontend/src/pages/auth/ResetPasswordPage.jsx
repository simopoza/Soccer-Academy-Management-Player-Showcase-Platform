import { useMemo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast, Button, Flex, FormControl, FormLabel, Input, FormErrorMessage, Text, Spinner, useColorModeValue, HStack } from "@chakra-ui/react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AuthCard from "../../components/ui/AuthCard";
import authService from "../../services/authService";
import { resetPasswordSchema } from "../../utils/validationSchemas";
import useLanguageSwitcher from "../../hooks/useLanguageSwitcher";
import ThemeToggle from "../../components/ui/ThemeToggle";

const ResetPasswordPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { switchLanguage, isArabic, currentLang } = useLanguageSwitcher();

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const token = searchParams.get("token");

  const resolver = useMemo(() => yupResolver(resetPasswordSchema(i18n)), [currentLang]);

  // Color mode values
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const linkColor = useColorModeValue("#2f855a", "green.300");

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast({
          title: t("resetPassword.invalidTokenTitle"),
          description: t("resetPassword.tokenMissing"),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate("/login");
        return;
      }

      try {
        const response = await authService.verifyResetToken(token);
        if (response.valid) {
          setTokenValid(true);
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        toast({
          title: t("resetPassword.invalidTokenTitle"),
          description: t("resetPassword.tokenExpired"),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate("/login");
      } finally {
        setIsValidating(false);
      }
    };

    verifyToken();
  }, [token, navigate, toast, t]);

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      toast({
        title: t("resetPassword.successTitle"),
        description: t("resetPassword.successDescription"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      reset();
      navigate("/login");
    } catch (error) {
      toast({
        title: t("resetPassword.errorTitle"),
        description: error.response?.data?.message || t("somethingWrong"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isValidating) {
    return (
      <AuthCard title={t("resetPassword.title")}>
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      </AuthCard>
    );
  }

  if (!tokenValid) {
    return null;
  }

  return (
    <AuthCard title={t("resetPassword.title")} subtitle={t("resetPassword.subtitle")}>
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
          <FormControl isInvalid={errors.newPassword}>
            <FormLabel fontSize="sm">{t("resetPassword.newPassword")}</FormLabel>
            <Input
              placeholder={t("resetPassword.newPasswordPlaceholder")}
              bg={inputBg}
              type="password"
              {...formRegister("newPassword")}
            />
            <FormErrorMessage>{errors.newPassword?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.confirmNewPassword}>
            <FormLabel fontSize="sm">{t("resetPassword.confirmPassword")}</FormLabel>
            <Input
              placeholder={t("resetPassword.confirmPasswordPlaceholder")}
              bg={inputBg}
              type="password"
              {...formRegister("confirmNewPassword")}
            />
            <FormErrorMessage>{errors.confirmNewPassword?.message}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="green"
            mt={2}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            {t("resetPassword.resetButton")}
          </Button>

          <Text fontSize="sm" textAlign="center" mt={2}>
            {t("resetPassword.rememberPassword")} {" "}
            <Link to="/login" style={{ color: linkColor, fontWeight: "500" }}>
              {t("resetPassword.backToLogin")}
            </Link>
          </Text>
        </Flex>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
