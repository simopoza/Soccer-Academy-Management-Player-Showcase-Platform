// import {
//   Box,
//   Container,
//   Heading,
//   Text,
//   VStack,
//   Card,
//   CardHeader,
//   CardBody,
//   FormControl,
//   FormLabel,
//   Input,
//   Button,
//   useToast,
//   useColorModeValue,
//   Divider,
//   Avatar,
//   HStack,
//   SimpleGrid
// } from "@chakra-ui/react";
// import { useState } from "react";
// import { useTranslation } from "react-i18next";
// import Layout from "../components/Layout";
// import { useAuth } from "../context/AuthContext";

// const AdminSettingsPage = () => {
//   const { t, i18n } = useTranslation();
//   const { user } = useAuth();
//   const toast = useToast();
//   const isRTL = i18n.language === "ar";

//   const [profileData, setProfileData] = useState({
//     firstName: user?.first_name || "",
//     lastName: user?.last_name || "",
//     email: user?.email || "",
//   });

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   // Color mode values
//   const bgGradient = useColorModeValue("white", "linear(to-b, gray.900, gray.800)");
//   const cardBg = useColorModeValue("white", "gray.700");
//   const textColor = useColorModeValue("gray.600", "gray.300");
//   const headingColor = useColorModeValue("green.700", "green.300");

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
//     toast({
//       title: t("success") || "Success",
//       description: t("profileUpdated") || "Profile updated successfully",
//       status: "success",
//       duration: 3000,
//       isClosable: true,
//     });
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
    
//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       toast({
//         title: t("error") || "Error",
//         description: t("passwordMismatch") || "Passwords do not match",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       return;
//     }

//     toast({
//       title: t("success") || "Success",
//       description: t("passwordChanged") || "Password changed successfully",
//       status: "success",
//       duration: 3000,
//       isClosable: true,
//     });

//     setPasswordData({
//       currentPassword: "",
//       newPassword: "",
//       confirmPassword: "",
//     });
//   };

//   return (
//     <Layout 
//       pageTitle={t("settings") || "Settings"}
//       pageSubtitle={t("manageAccount") || "Manage your account settings"}
//     >
//       <Box minH="100vh" bg={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
//         <Container maxW="container.xl">
//           <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
//             {/* Profile Section */}
//             <Card
//               bg={cardBg}
//               boxShadow="lg"
//               display="flex"
//               flexDirection="column"
//             >
//               <CardHeader>
//                 <Heading size="md" color={headingColor}>
//                   {t("profileInformation") || "Profile Information"}
//                 </Heading>
//                 <Text color={textColor} fontSize="sm" mt={1}>
//                   {t("updateProfileInfo") || "Update your account profile information"}
//                 </Text>
//               </CardHeader>
//               <CardBody flex="1" display="flex" flexDirection="column">
//                 <VStack spacing={4} align="stretch">
//                   <HStack spacing={4} mb={4}>
//                     <Avatar
//                       size="xl"
//                       name={`${user?.first_name} ${user?.last_name}`}
//                       bg="green.500"
//                     />
//                     <VStack align="start" spacing={0}>
//                       <Text fontWeight="bold" fontSize="lg">
//                         {user?.first_name} {user?.last_name}
//                       </Text>
//                       <Text fontSize="sm" color={textColor} textTransform="capitalize">
//                         {user?.role}
//                       </Text>
//                       <Text fontSize="sm" color={textColor}>
//                         {user?.email}
//                       </Text>
//                     </VStack>
//                   </HStack>

//                   <Divider />

//                   <form onSubmit={handleProfileUpdate}>
//                     <VStack spacing={4}>
//                       <FormControl>
//                         <FormLabel>{t("firstName") || "First Name"}</FormLabel>
//                         <Input
//                           value={profileData.firstName}
//                           onChange={(e) =>
//                             setProfileData({ ...profileData, firstName: e.target.value })
//                           }
//                           placeholder={t("enterFirstName") || "Enter first name"}
//                         />
//                       </FormControl>

//                       <FormControl>
//                         <FormLabel>{t("lastName") || "Last Name"}</FormLabel>
//                         <Input
//                           value={profileData.lastName}
//                           onChange={(e) =>
//                             setProfileData({ ...profileData, lastName: e.target.value })
//                           }
//                           placeholder={t("enterLastName") || "Enter last name"}
//                         />
//                       </FormControl>

//                       <FormControl>
//                         <FormLabel>{t("email") || "Email"}</FormLabel>
//                         <Input
//                           type="email"
//                           value={profileData.email}
//                           onChange={(e) =>
//                             setProfileData({ ...profileData, email: e.target.value })
//                           }
//                           placeholder={t("enterEmail") || "Enter email"}
//                         />
//                       </FormControl>

//                       <Button
//                         type="submit"
//                         colorScheme="green"
//                         w="full"
//                         mt={2}
//                       >
//                         {t("updateProfile") || "Update Profile"}
//                       </Button>
//                     </VStack>
//                   </form>
//                 </VStack>
//               </CardBody>
//             </Card>

//             {/* Password Section */}
//             <Card
//               bg={cardBg}
//               boxShadow="lg"
//               display="flex"
//               flexDirection="column"
//             >
//               <CardHeader>
//                 <Heading size="md" color={headingColor}>
//                   {t("changePassword") || "Change Password"}
//                 </Heading>
//                 <Text color={textColor} fontSize="sm" mt={1}>
//                   {t("updatePassword") || "Update your password to keep your account secure"}
//                 </Text>
//               </CardHeader>
//               <CardBody display="flex" flexDirection="column" flex="1">
//                 <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//                   <VStack spacing={4} flex="1">
//                     <FormControl isRequired>
//                       <FormLabel>{t("currentPassword") || "Current Password"}</FormLabel>
//                       <Input
//                         type="password"
//                         value={passwordData.currentPassword}
//                         onChange={(e) =>
//                           setPasswordData({ ...passwordData, currentPassword: e.target.value })
//                         }
//                         placeholder={t("enterCurrentPassword") || "Enter current password"}
//                       />
//                     </FormControl>

//                     <FormControl isRequired>
//                       <FormLabel>{t("newPassword") || "New Password"}</FormLabel>
//                       <Input
//                         type="password"
//                         value={passwordData.newPassword}
//                         onChange={(e) =>
//                           setPasswordData({ ...passwordData, newPassword: e.target.value })
//                         }
//                         placeholder={t("enterNewPassword") || "Enter new password"}
//                       />
//                     </FormControl>

//                     <FormControl isRequired>
//                       <FormLabel>{t("confirmPassword") || "Confirm Password"}</FormLabel>
//                       <Input
//                         type="password"
//                         value={passwordData.confirmPassword}
//                         onChange={(e) =>
//                           setPasswordData({ ...passwordData, confirmPassword: e.target.value })
//                         }
//                         placeholder={t("confirmNewPassword") || "Confirm new password"}
//                       />
//                     </FormControl>

//                     <Box flex="1" />

//                     <Button
//                       type="submit"
//                       colorScheme="green"
//                       w="full"
//                     >
//                       {t("changePassword") || "Change Password"}
//                     </Button>
//                   </VStack>
//                 </form>
//               </CardBody>
//             </Card>
//           </SimpleGrid>
//         </Container>
//       </Box>
//     </Layout>
//   );
// };

// export default AdminSettingsPage;

import { useAuth } from "../context/AuthContext";
import SettingsPage from "../components/SettingsPage";

const AdminSettingsPage = () => {
  const { user } = useAuth();
  return <SettingsPage user={user} />;
};

export default AdminSettingsPage;
