import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../utils/validationSchemas";
import authService from "../services/authService";
import { useToast, Button, Flex, FormControl, FormLabel, Input, Select, HStack, Text, FormErrorMessage } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const toast = useToast();

  // 🔹 Create resolver dynamically when language changes
  const resolver = useMemo(() => yupResolver(registerSchema(i18n)), [i18n.language]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver });

  // Reset form values on language switch (keeps user input)
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
      await authService.register(data);

      toast({
        title: t("successRegister"),
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
        title: t("failedRegister"),
        description: error.response?.data?.message || t("somethingWrong"),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <AuthCard title={t("joinAcademy")} subtitle={t("createAccount")}>
      <Flex justify="flex-end">
        <Button size="sm" variant="outline" onClick={switchLanguage}>
          {i18n.language === "en" ? "العربية" : "English"}
        </Button>
      </Flex>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={4}>
          <HStack spacing={4}>
            <FormControl isInvalid={errors.first_name}>
              <FormLabel fontSize="sm">{t("firstName")}</FormLabel>
              <Input
                placeholder={t("firstNamePlaceholder")}
                bg="gray.50"
                {...register("first_name")}
              />
              <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.last_name}>
              <FormLabel fontSize="sm">{t("lastName")}</FormLabel>
              <Input
                placeholder={t("lastNamePlaceholder")}
                bg="gray.50"
                {...register("last_name")}
              />
              <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
            </FormControl>
          </HStack>

          <FormControl isInvalid={errors.email}>
            <FormLabel fontSize="sm">{t("email")}</FormLabel>
            <Input
              placeholder="john.doe@example.com"
              bg="gray.50"
              type="email"
              {...register("email")}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.password}>
            <FormLabel fontSize="sm">{t("password")}</FormLabel>
            <Input
              placeholder="*********"
              bg="gray.50"
              type="password"
              {...register("password")}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.role}>
            <FormLabel fontSize="sm">{t("role")}</FormLabel>
            <Select placeholder={t("selectRole")} bg="gray.50" {...register("role")}>
              <option value="admin">{t("admin")}</option>
              <option value="player">{t("player")}</option>
              <option value="agent">{t("agent")}</option>
            </Select>
            <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
          </FormControl>

          <Button type="submit" colorScheme="green" mt={2} isLoading={isSubmitting}>
            {t("register")}
          </Button>

          <Text fontSize="sm" textAlign="center" mt={2}>
            {t("alreadyAccount")}{" "}
            <Link to="/login" style={{ color: "#2f855a", fontWeight: "500" }}>
              {t("loginHere")}
            </Link>
          </Text>
        </Flex>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;