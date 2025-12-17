import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  Avatar,
  HStack,
  Text,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";

const ProfileForm = ({ user }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { updateUser } = useAuth();
  const textColor = useColorModeValue("gray.600", "gray.300");

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form when user prop changes
  useEffect(() => {
    setProfileData({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleInputChange = (field) => (e) => {
    setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build payload with all current values
      const payload = {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email.trim(),
      };

      // Check if nothing changed
      const hasChanges = 
        payload.firstName !== (user.first_name || "").trim() ||
        payload.lastName !== (user.last_name || "").trim() ||
        payload.email !== (user.email || "").trim();

      if (!hasChanges) {
        toast({
          title: t("info") || "Info",
          description: t("noChanges") || "Nothing changed",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const response = await userService.updateUserProfile(user.id, payload);
      
      // Update user context with new data
      updateUser(response.user);

      toast({
        title: t("success") || "Success",
        description: response.message || t("profileUpdated") || "Profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: t("error") || "Error",
        description: error.response?.data?.message || error.response?.data?.error || t("profileUpdateFailed") || "Failed to update profile",
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
      <VStack spacing={4} align="stretch" flex="1">
        <HStack spacing={4} mb={4}>
          <Avatar size="xl" name={`${user?.first_name} ${user?.last_name}`} bg="green.500" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" fontSize="lg">
              {user?.first_name} {user?.last_name}
            </Text>
            <Text fontSize="sm" color={textColor} textTransform="capitalize">
              {user?.role}
            </Text>
            <Text fontSize="sm" color={textColor}>
              {user?.email}
            </Text>
          </VStack>
        </HStack>

        <Divider />

        <FormControl isRequired>
          <FormLabel>{t("firstName") || "First Name"}</FormLabel>
          <Input
            value={profileData.firstName}
            onChange={handleInputChange("firstName")}
            placeholder={t("enterFirstName") || "Enter first name"}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t("lastName") || "Last Name"}</FormLabel>
          <Input
            value={profileData.lastName}
            onChange={handleInputChange("lastName")}
            placeholder={t("enterLastName") || "Enter last name"}
            isDisabled={isLoading}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>{t("email") || "Email"}</FormLabel>
          <Input
            type="email"
            value={profileData.email}
            onChange={handleInputChange("email")}
            placeholder={t("enterEmail") || "Enter email"}
            isDisabled={isLoading}
          />
        </FormControl>

        <Button type="submit" colorScheme="green" w="full" mt={2} isLoading={isLoading} loadingText={t("updating") || "Updating..."}>
          {t("updateProfile") || "Update Profile"}
        </Button>
      </VStack>
    </form>
  );
};

export default ProfileForm;
