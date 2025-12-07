// import { useToast, Button, Flex, FormControl, Input } from "@chakra-ui/react";
// import authService from "../services/authService";
// import { useEffect, useMemo } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { loginSchema } from "../utils/validationSchemas";
// import AuthCard from "../components/AuthCard";
// import i18next from "i18next";

// const LoginPage = () => {
//   const { t, i18n } = useTranslation();
//   const toast = useToast();

//   // 🔹 Create resolver dynamically when language changes
//   const resolver = useMemo(() => yupResolver(loginSchema(i18n)), [i18n.language]);

//   const {
//     register,
//     handleSubmit,
//     setError,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm({ resolver });

//   // Reset form values on language switch (keeps user input)
//   useEffect(() => {
//     reset(undefined, { keepValues: true });
//   }, [i18n.language]);

//   const switchLanguage = () => {
//     const newLang = i18n.language === "en" ? "ar" : "en";
//     i18n.changeLanguage(newLang);
//     document.body.dir = newLang === "ar" ? "rtl" : "ltr";
//   };

//   const onSubmit = async (data) => {
//     try {
//       await authService.login(data);

//       toast({
//         title: t("successfulLogin"),
//         description: t("successMessage"),
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//     } catch (error) {
//       if (error.response?.data?.errors) {
//         const fieldErrors = error.response.data.errors;
//         Object.keys(fieldErrors).forEach((field) => {
//           setError(field, {
//             type: "server",
//             message: fieldErrors[field],
//           });
//         });
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
//     <AuthCard
//       title={t("Welcome Back!")}
//       subtitle={t("Please log in to your account")}
//     >
//       <Flex justify="flex-end">
//         <Button size="sm" variant="outline" onClick={switchLanguage}>
//           {i18next.language === "en" ? "العربية" : "English"}
//         </Button>
//       </Flex>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <FormControl isInvalid={errors.email}>
//           <FormLabel fontSize="sm">{t("Email")}</FormLabel>
//           <Input
//             placeholder="john.doe@example.com"
//             bg="gray.50"
//             type="email"
//             {...register("email")}
//           />
//           <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
//         </FormControl>

//         <FormControl mt={4} isInvalid={errors.password}>
//           <FormLabel fontSize="sm">{t("Password")}</FormLabel>
//           <Input
//             placeholder="********"
//             bg="gray.50"
//             type="password"
//             {...register("password")}
//           />
//           <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
//         </FormControl>
//         <Button
//           type="submit"
//           colorScheme="green"
//           mt={2}
//           isLoading={isSubmitting}
//         >
//           {t("Log In")}
//         </Button>

//         <Text fontSize="sm" textAlign="center" mt={2}>
//           {t("Don't have an account?")}
//           <Link to="/register" style={{ color: "#2f855a", fontWeight: "500" }}>
//             {t("Register Now")}
//           </Link>
//         </Text>
//       </form>
//     </AuthCard>
//   );
// };

// export default LoginPage;


import { useToast, Button, Flex, FormControl, Input, FormLabel, FormErrorMessage, Text } from "@chakra-ui/react";
import authService from "../services/authService";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginSchema } from "../utils/validationSchemas";
import AuthCard from "../components/AuthCard";

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();

  const resolver = useMemo(() => yupResolver(loginSchema(i18n)), [i18n.language]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver });

  useEffect(() => {
    reset(undefined, { keepValues: true });
  }, [i18n.language]);

  const switchLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.body.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  const onSubmit = async (data) => {
    try {
      await authService.login(data);
      toast({
        title: t("successLogin"),
        description: t("successMessage"),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        const fieldErrors = error.response.data.errors;
        Object.keys(fieldErrors).forEach((field) => {
          setError(field, {
            type: "server",
            message: fieldErrors[field],
          });
        });
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

  return (
    <AuthCard
      title={t("Welcome Back!")}
      subtitle={t("Please log in to your account")}
    >
      <Flex justify="flex-end">
        <Button size="sm" variant="outline" onClick={switchLanguage}>
          {i18n.language === "en" ? "العربية" : "English"}
        </Button>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl mt={4} isInvalid={errors.email}>
          <FormLabel fontSize="sm">{t("email")}</FormLabel>
          <Input
            placeholder={t("john.doe@example.com")}
            bg="gray.50"
            type="email"
            {...register("email")}
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl mt={4} isInvalid={errors.password}>
          <FormLabel fontSize="sm">{t("password")}</FormLabel>
          <Input
            placeholder={t("**************")}
            bg="gray.50"
            type="password"
            {...register("password")}
          />
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="green"
          mt={2}
          isLoading={isSubmitting}
        >
          {t("Log In")}
        </Button>

        <Text fontSize="sm" textAlign="center" mt={2}>
          {t("Don't have an account?")}{" "}
          <Link to="/" style={{ color: "#2f855a", fontWeight: "500" }}>
            {t("Register Now")}
          </Link>
        </Text>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
