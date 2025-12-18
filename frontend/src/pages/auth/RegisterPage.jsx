// (content copied from original RegisterPage.jsx, adjusted imports)
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useToast, useColorModeValue, Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import AuthCard from "../../components/ui/AuthCard";
import AuthForm from "../../components/forms/AuthForm";
import authService from "../../services/authService";
import { registerSchema } from "../../utils/validationSchemas";
import useLanguageSwitcher from "../../hooks/useLanguageSwitcher";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { switchLanguage, isArabic, currentLang } = useLanguageSwitcher();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-b, green.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );

  const resolver = useMemo(() => yupResolver(registerSchema(i18n)), [currentLang]);

  const {
    register: formRegister,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver });

  useEffect(() => {
    reset(undefined, { keepValues: true });
  }, [currentLang]);

  const onSubmit = async (data) => {
    try {
      await authService.register(data);

      // Show success message with approval info
      toast({
        title: t("successRegister"),
        description: t("successMessage"),
        status: "success",
        duration: 8000, // Longer duration so user can read the message
        isClosable: true,
      });

      // Reset form
      reset();

      // Redirect to login page (user can't login yet, but they know where to go)
      setTimeout(() => {
        navigate("/login");
      }, 1500); // Small delay so user can read the success message
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors;
        Object.keys(fieldErrors).forEach((field) =>
          setError(field, { type: "server", message: fieldErrors[field] })
        );
      }

      // Handle specific error cases
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      let toastTitle = t("failedRegister");
      let toastDescription = t("somethingWrong");

      if (statusCode === 400 && responseData?.message?.includes("admin")) {
        // Trying to register as admin
        toastTitle = t("registrationNotAllowed");
        toastDescription = t("adminRegistrationError");
      } else {
        toastDescription = responseData?.message || t("somethingWrong");
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const fields = [
    {
      type: "hstack",
      name: "nameGroup",
      inputs: [
        { name: "first_name", label: t("firstName"), placeholder: t("firstNamePlaceholder"), register: formRegister("first_name"), error: errors.first_name },
        { name: "last_name", label: t("lastName"), placeholder: t("lastNamePlaceholder"), register: formRegister("last_name"), error: errors.last_name },
      ],
    },
    { name: "email", label: t("email"), placeholder: "john.doe@example.com", register: formRegister("email"), error: errors.email },
    { name: "password", label: t("password"), placeholder: "*********", type: "password", register: formRegister("password"), error: errors.password },
    { name: "role", label: t("role"), component: "select", placeholder: t("selectRole"), register: formRegister("role"), error: errors.role,
      options: [
        { value: "player", label: t("player") },
        { value: "agent", label: t("agent") },
      ],
    },
  ];

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient={bgGradient} py={8}>
      <AuthCard title={t("joinAcademy")} subtitle={t("createAccount")}>
        <AuthForm
          fields={fields}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          switchLanguage={switchLanguage}
          isArabic={isArabic}
          buttonText={t("register")}
          bottomText={t("alreadyAccount")}
          bottomLink="/login"
          bottomLinkText={t("loginHere")}
        />
      </AuthCard>
    </Box>
  );
};

export default RegisterPage;
