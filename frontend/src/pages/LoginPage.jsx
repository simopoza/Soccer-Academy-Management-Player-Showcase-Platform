// import { useEffect, useMemo } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useToast, Button, Flex, FormControl, FormLabel, Input, FormErrorMessage, Text } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// import AuthCard from "../components/AuthCard";
// import authService from "../services/authService";
// import { loginSchema } from "../utils/validationSchemas";
// import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

// const LoginPage = () => {
//   const { t, i18n } = useTranslation();
//   const toast = useToast();
//   const { switchLanguage, isArabic, currentLang } = useLanguageSwitcher();

//   // 🔹 Create resolver dynamically when language changes
//   const resolver = useMemo(() => yupResolver(loginSchema(i18n)), [currentLang]);

//   // 🔹 React Hook Form setup
//   const {
//     register: formRegister,
//     handleSubmit,
//     setError,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({ resolver });

//   // 🔹 Reset form values on language switch, keep user input
//   useEffect(() => {
//     reset(undefined, { keepValues: true });
//   }, [currentLang]);

//   // 🔹 Form submit handler
//   const onSubmit = async (data) => {
//     try {
//       const response = await authService.login(data);
//       const user = response.user; // user object returned from backend

//       console.log("Logged in user:", user);

//       // 🔹 Role-based navigation
//       switch (user.role) {
//         case "player":
//           navigate("/complete-profile"); // redirect player to complete profile
//           break;
//         case "admin":
//           navigate("/admin/dashboard"); // redirect admin to dashboard
//           break;
//         case "agent":
//           navigate("/agent/dashboard"); // redirect agent to dashboard
//           break;
//         default:
//           navigate("/login"); // fallback
//       }
//       toast({
//         title: t("successLogin"),
//         description: t("successMessage"),
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//     } catch (error) {
//       if (error.response?.data?.errors) {
//         const fieldErrors = error.response.data.errors;
//         Object.keys(fieldErrors).forEach((field) =>
//           setError(field, { type: "server", message: fieldErrors[field] })
//         );
//       }

//       toast({
//         title: t("failedLogin"),
//         description: error.response?.data?.message || t("somethingWrong"),
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <AuthCard title={t("loginTitle")} subtitle={t("loginSubtitle")}>
//       {/* 🔹 Language switch button */}
//       <Flex justify="flex-end" mb={4}>
//         <Button size="sm" variant="outline" onClick={switchLanguage}>
//           {isArabic ? "English" : "العربية"}
//         </Button>
//       </Flex>

//       {/* 🔹 Login form */}
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Flex direction="column" gap={4}>
//           {/* Email */}
//           <FormControl isInvalid={errors.email}>
//             <FormLabel fontSize="sm">{t("email")}</FormLabel>
//             <Input
//               placeholder={t("emailPlaceholder")}
//               bg="gray.50"
//               type="email"
//               {...formRegister("email")}
//             />
//             <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Password */}
//           <FormControl isInvalid={errors.password}>
//             <FormLabel fontSize="sm">{t("password")}</FormLabel>
//             <Input
//               placeholder={t("passwordPlaceholder")}
//               bg="gray.50"
//               type="password"
//               {...formRegister("password")}
//             />
//             <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Submit button */}
//           <Button
//             type="submit"
//             colorScheme="green"
//             mt={2}
//             isLoading={isSubmitting}
//             isDisabled={isSubmitting} // optional: prevent double submission
//           >
//             {t("login")}
//           </Button>

//           {/* No account link */}
//           <Text fontSize="sm" textAlign="center" mt={2}>
//             {t("noAccount")}{" "}
//             <Link to="/" style={{ color: "#2f855a", fontWeight: "500" }}>
//               {t("registerHere")}
//             </Link>
//           </Text>
//         </Flex>
//       </form>
//     </AuthCard>
//   );
// };

// export default LoginPage;

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useToast } from "@chakra-ui/react";
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
        description: t("successMessage"),
        status: "success",
        duration: 5000,
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
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors;
        Object.keys(fieldErrors).forEach((field) =>
          setError(field, { type: "server", message: fieldErrors[field] })
        );
      }
      toast({
        title: t("failedLogin"),
        description: error.response?.data?.message || t("somethingWrong"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fields = [
    { name: "email", label: t("email"), placeholder: "john.doe@example.com", register: formRegister("email"), error: errors.email },
    { name: "password", label: t("password"), placeholder: "**************", type: "password", register: formRegister("password"), error: errors.password },
  ];

  return (
    <AuthCard title={t("loginTitle")} subtitle={t("loginSubtitle")}>
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
      />
    </AuthCard>
  );
};

export default LoginPage;