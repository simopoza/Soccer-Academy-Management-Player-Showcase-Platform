import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast, useColorModeValue, Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import AuthCard from "../components/AuthCard";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validationSchemas";
import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { login } = useAuth(); // Use AuthContext
  const { switchLanguage, isArabic, currentLang } = useLanguageSwitcher();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-b, green.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );

  const resolver = useMemo(() => yupResolver(loginSchema(i18n)), [currentLang]);

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
      // Use AuthContext login method
      const result = await login(data.email, data.password);

      if (!result.success) {
        // Handle login failure
        toast({
          title: t("failedLogin"),
          description: result.error || t("somethingWrong"),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const user = result.user;
      console.log("Logged in user:", user);

      // Reset form
      reset();

      // Show success message
      toast({
        title: t("successLogin"),
        description: t("loginSuccessMessage"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // 🔹 Role-based navigation with profile_completed check
      switch (user.role) {
        case "player":
          // Check if player completed profile
          if (user.profile_completed) {
            navigate("/player/dashboard");  // Already completed
          } else {
            navigate("/complete-profile");  // First time - needs to complete
          }
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "agent":
          navigate("/agent/dashboard");
          break;
        default:
          navigate("/login");
      }
    } catch (error) {
      // Handle validation errors
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors;
        Object.keys(fieldErrors).forEach((field) =>
          setError(field, { type: "server", message: fieldErrors[field] })
        );
      }

      // Handle different status codes
      const statusCode = error.response?.status;
      const responseData = error.response?.data;
      
      let toastTitle = t("failedLogin");
      let toastDescription = t("somethingWrong");
      let toastStatus = "error";

      if (statusCode === 403) {
        // Check if it's a status-related error
        if (responseData?.status === 'pending') {
          toastTitle = "Account Pending Approval";
          toastDescription = "Your account is pending admin approval. You will receive an email once approved.";
          toastStatus = "warning";
        } else if (responseData?.status === 'rejected') {
          toastTitle = "Account Not Approved";
          toastDescription = "Your account was not approved. Please contact the administrator for more information.";
          toastStatus = "error";
        } else {
          // Generic 403 error
          toastDescription = responseData?.message || "Access denied.";
        }
      } else if (statusCode === 401) {
        toastTitle = "Login Failed";
        toastDescription = "Invalid email or password. Please try again.";
      } else {
        // Other errors (500, network errors, etc.)
        toastDescription = responseData?.message || t("somethingWrong");
      }

      toast({
        title: toastTitle,
        description: toastDescription,
        status: toastStatus,
        duration: 7000,
        isClosable: true,
      });
    }
  };

  const fields = [
    { name: "email", label: t("email"), placeholder: "john.doe@example.com", register: formRegister("email"), error: errors.email },
    { name: "password", label: t("password"), placeholder: "**************", type: "password", register: formRegister("password"), error: errors.password },
  ];

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bgGradient={bgGradient} py={8}>
      <AuthCard title={t("loginTitle")} subtitle={t("loginSubtitle")} maxWidth="460px">
        <AuthForm
          fields={fields}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          switchLanguage={switchLanguage}
          isArabic={isArabic}
          buttonText={t("login")}
          bottomText={t("noAccount")}
          bottomLink="/"
          bottomLinkText={t("registerHere")}
          forgotPasswordLink={t("forgotPasswordLink")}
        />
      </AuthCard>
    </Box>
  );
};

export default LoginPage;