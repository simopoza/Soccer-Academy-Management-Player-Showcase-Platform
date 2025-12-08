// import { useEffect, useMemo } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useNavigate, Link } from "react-router-dom";
// import { useToast, Button, Flex, FormControl, FormLabel, Input, Select, HStack, Text, FormErrorMessage } from "@chakra-ui/react";
// import { useTranslation } from "react-i18next";

// import AuthCard from "../components/AuthCard";
// import authService from "../services/authService";
// import { registerSchema } from "../utils/validationSchemas";
// import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

// const RegisterPage = () => {
//   const { t, i18n } = useTranslation();
//   const toast = useToast();
//   const navigate = useNavigate();
//   const { switchLanguage, isArabic, currentLang } = useLanguageSwitcher();

//   // 🔹 Create resolver dynamically when language changes
//   const resolver = useMemo(() => yupResolver(registerSchema(i18n)), [currentLang]);

//   // 🔹 React Hook Form setup
//   const {
//     register: formRegister,
//     handleSubmit,
//     setError,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({ resolver });

//   // 🔹 Reset validation messages on language switch, keep user input
//   useEffect(() => {
//     reset(undefined, { keepValues: true });
//   }, [currentLang]);

//   // 🔹 Form submit handler
//   const onSubmit = async (data) => {
//     try {
//       await authService.register(data);

//       toast({
//         title: t("successRegister"),
//         description: t("successMessage"),
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });

//       navigate("/login");
//     } catch (error) {
//       if (error.response?.data?.errors) {
//         const fieldErrors = error.response.data.errors;
//         Object.keys(fieldErrors).forEach((field) =>
//           setError(field, { type: "server", message: fieldErrors[field] })
//         );
//       }

//       toast({
//         title: t("failedRegister"),
//         description: error.response?.data?.message || t("somethingWrong"),
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <AuthCard title={t("joinAcademy")} subtitle={t("createAccount")}>
//       {/* 🔹 Language switch button */}
//       <Flex justify="flex-end" mb={4}>
//         <Button size="sm" variant="outline" onClick={switchLanguage}>
//           {isArabic ? "English" : "العربية"}
//         </Button>
//       </Flex>

//       {/* 🔹 Registration form */}
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Flex direction="column" gap={4}>
//           {/* Name fields */}
//           <HStack spacing={4}>
//             <FormControl isInvalid={errors.first_name}>
//               <FormLabel fontSize="sm">{t("firstName")}</FormLabel>
//               <Input
//                 placeholder={t("firstNamePlaceholder")}
//                 bg="gray.50"
//                 {...formRegister("first_name")}
//               />
//               <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
//             </FormControl>

//             <FormControl isInvalid={errors.last_name}>
//               <FormLabel fontSize="sm">{t("lastName")}</FormLabel>
//               <Input
//                 placeholder={t("lastNamePlaceholder")}
//                 bg="gray.50"
//                 {...formRegister("last_name")}
//               />
//               <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
//             </FormControl>
//           </HStack>

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

//           {/* Role */}
//           <FormControl isInvalid={errors.role}>
//             <FormLabel fontSize="sm">{t("role")}</FormLabel>
//             <Select
//               placeholder={t("selectRole")}
//               bg="gray.50"
//               {...formRegister("role")}
//             >
//               <option value="admin">{t("admin")}</option>
//               <option value="player">{t("player")}</option>
//               <option value="agent">{t("agent")}</option>
//             </Select>
//             <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Submit button */}
//           <Button
//             type="submit"
//             colorScheme="green"
//             mt={2}
//             isLoading={isSubmitting}
//             isDisabled={isSubmitting} // optional: prevent double submission
//           >
//             {t("register")}
//           </Button>

//           {/* Already have an account */}
//           <Text fontSize="sm" textAlign="center" mt={2}>
//             {t("alreadyAccount")}{" "}
//             <Link to="/login" style={{ color: "#2f855a", fontWeight: "500" }}>
//               {t("loginHere")}
//             </Link>
//           </Text>
//         </Flex>
//       </form>
//     </AuthCard>
//   );
// };

// export default RegisterPage;

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import AuthCard from "../components/AuthCard";
import AuthForm from "../components/AuthForm";
import authService from "../services/authService";
import { registerSchema } from "../utils/validationSchemas";
import useLanguageSwitcher from "../hooks/useLanguageSwitcher";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { switchLanguage, isArabic, currentLang } = useLanguageSwitcher();

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
      const response = await authService.register(data);
      const user = response.user; // user object returned from backend

      toast({
        title: t("successRegister"),
        description: t("successMessage"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // 🔹 Role-based navigation
      switch (user.role) {
        case "player":
          navigate("/complete-profile"); // redirect player to complete profile
          break;
        case "admin":
          navigate("/admin/dashboard"); // redirect admin to dashboard
          break;
        case "agent":
          navigate("/agent/dashboard"); // redirect agent to dashboard
          break;
        default:
          navigate("/login"); // fallback
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors;
        Object.keys(fieldErrors).forEach((field) =>
          setError(field, { type: "server", message: fieldErrors[field] })
        );
      }
      toast({
        title: t("failedRegister"),
        description: error.response?.data?.message || t("somethingWrong"),
        status: "error",
        duration: 5000,
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
        { value: "admin", label: t("admin") },
        { value: "player", label: t("player") },
        { value: "agent", label: t("agent") },
      ],
    },
  ];

  return (
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
  );
};

export default RegisterPage;
