import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Box,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import userService from "../../services/userService";

const PasswordForm = ({ user }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t("error") || "Error",
        description: t("passwordMismatch") || "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await userService.updateUserPassword(user.id, passwordData);

      toast({
        title: t("success") || "Success",
        description: response.message || t("passwordChanged") || "Password changed successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      resetForm();
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.response?.data?.message || t("passwordChangeFailed") || "Failed to change password",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <VStack spacing={4} flex="1">
        <FormControl isRequired>
          <FormLabel>{t("currentPassword") || "Current Password"}</FormLabel>
          <Input
            type="password"
            value={passwordData.currentPassword}
            onChange={handleInputChange("currentPassword")}
            placeholder={t("enterCurrentPassword") || "Enter current password"}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t("newPassword") || "New Password"}</FormLabel>
          <Input
            type="password"
            value={passwordData.newPassword}
            onChange={handleInputChange("newPassword")}
            placeholder={t("enterNewPassword") || "Enter new password"}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t("confirmPassword") || "Confirm Password"}</FormLabel>
          <Input
            type="password"
            value={passwordData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            placeholder={t("confirmNewPassword") || "Confirm new password"}
            isDisabled={isLoading}
          />
        </FormControl>

        <Box flex="1" />
        <Button type="submit" colorScheme="green" w="full" isLoading={isLoading} loadingText={t("updating") || "Updating..."}>
          {t("changePassword") || "Change Password"}
        </Button>
      </VStack>
    </form>
  );
};

export default PasswordForm;
