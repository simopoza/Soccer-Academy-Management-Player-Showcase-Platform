// import { Box, Button, Flex, FormControl, FormLabel, Input, Select, HStack, Text, FormErrorMessage } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import AuthCard from "../components/AuthCard";
// import { registerSchema } from "../utils/validationSchemas";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import authService from "../services/authService";
// import { useToast } from "@chakra-ui/react";

// const RegisterPage = () => {
//   const toast = useToast();

//   // RHF setup with Yup
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(registerSchema),
//   });

//   // TEMP submit handler
//   const onSubmit = async (data) => {
//     try {
//       await authService.register(data); // call backend
//       toast({
//         title: "Registration successful",
//         description: "You can now log in!",
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.log(error);

//       toast({
//         title: "Registration failed",
//         description:
//           error.response?.data?.message || "Something went wrong",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <AuthCard
//       title="Join Our Academy"
//       subtitle="Create your account to start your football journey"
//     >
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Flex direction="column" gap={4}>
//           {/* First + Last Name */}
//           <HStack spacing={4}>
//             <FormControl isInvalid={errors.firstName}>
//               <FormLabel fontSize="sm">First Name</FormLabel>
//               <Input placeholder="Mohammed" bg="gray.50" {...register("firstName")}/>
//               <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
//             </FormControl>

//             <FormControl isInvalid={errors.lastName}>
//               <FormLabel fontSize="sm">Last Name</FormLabel>
//               <Input placeholder="Annahri" bg="gray.50" {...register("lastName")}/>
//               <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
//             </FormControl>
//           </HStack>

//           {/* Email */}
//           <FormControl>
//             <FormLabel fontSize="sm">Email</FormLabel>
//             <Input placeholder="john.doe@example.com" bg="gray.50" type="email"/>
//           </FormControl>

//           {/* Password */}
//           <FormControl isInvalid={errors.password}>
//             <FormLabel fontSize="sm">Password</FormLabel>
//             <Input placeholder="*********" bg="gray.50" type="password" {...register("password")}/>
//             <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Role */}
//           <FormControl isInvalid={errors.role}>
//             <FormLabel fontSize="sm">Role</FormLabel>
//             <Select placeholder="Select your role" bg="gray.50" {...register("role")}>
//               <option value="admin">admin</option>
//               <option value="player">player</option>
//               <option value="agent">agent</option>
//             </Select>
//             <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Submit button */}
//           <Button type="submit" isLoading={isSubmitting} colorScheme="green" mt={2}>
//             Register
//           </Button>

//           {/* Already have an account */}
//           <Text fontSize="sm" textAlign="center" mt={2}>
//             Already have an account?{" "}
//             <Link to="/login" style={{ color: "#2f855a", fontWeight: "500" }}>
//               Login here
//             </Link>
//           </Text>
//         </Flex>
//       </form>
//     </AuthCard>
//   );
// };

// export default RegisterPage;






// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { registerSchema } from "../utils/validationSchemas";
// import authService from "../services/authService";
// import { useToast } from "@chakra-ui/react";
// import {
//   Box,
//   Button,
//   Flex,
//   FormControl,
//   FormLabel,
//   Input,
//   Select,
//   HStack,
//   Text,
//   FormErrorMessage,
// } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import AuthCard from "../components/AuthCard";
// import { useTranslation } from 'react-i18next';


// const RegisterPage = () => {
//   const { t } = useTranslation();
//   const toast = useToast();

//   const {
//     register,
//     handleSubmit,
//     setError,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: yupResolver(registerSchema),
//   });

//   const onSubmit = async (data) => {
//     try {
//       await authService.register(data);

//       toast({
//         title: "Registration successful",
//         description: "You can now log in!",
//         status: "success",
//         duration: 5000,
//         isClosable: true,
//       });
//     } catch (error) {
//       console.log(error);

//       // Map backend errors to form fields if available
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
//         title: "Registration failed",
//         description:
//           error.response?.data?.message || "Something went wrong",
//         status: "error",
//         duration: 5000,
//         isClosable: true,
//       });
//     }
//   };

//   return (
//     <AuthCard
//       title="Join Our Academy"
//       subtitle="Create your account to start your football journey"
//     >
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Flex direction="column" gap={4}>
//           {/* First + Last Name */}
//           <HStack spacing={4}>
//             <FormControl isInvalid={errors.firstName}>
//               <FormLabel fontSize="sm">First Name</FormLabel>
//               <Input
//                 placeholder="Mohammed"
//                 bg="gray.50"
//                 {...register("first_name")}
//               />
//               <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
//             </FormControl>

//             <FormControl isInvalid={errors.last_name}>
//               <FormLabel fontSize="sm">Last Name</FormLabel>
//               <Input
//                 placeholder="Annahri"
//                 bg="gray.50"
//                 {...register("last_name")}
//               />
//               <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
//             </FormControl>
//           </HStack>

//           {/* Email */}
//           <FormControl isInvalid={errors.email}>
//             <FormLabel fontSize="sm">Email</FormLabel>
//             <Input
//               placeholder="john.doe@example.com"
//               bg="gray.50"
//               type="email"
//               {...register("email")}
//             />
//             <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Password */}
//           <FormControl isInvalid={errors.password}>
//             <FormLabel fontSize="sm">Password</FormLabel>
//             <Input
//               placeholder="*********"
//               bg="gray.50"
//               type="password"
//               {...register("password")}
//             />
//             <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Role */}
//           <FormControl isInvalid={errors.role}>
//             <FormLabel fontSize="sm">Role</FormLabel>
//             <Select
//               placeholder="Select your role"
//               bg="gray.50"
//               {...register("role")}
//             >
//               <option value="admin">admin</option>
//               <option value="player">player</option>
//               <option value="agent">agent</option>
//             </Select>
//             <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
//           </FormControl>

//           {/* Submit button */}
//           <Button
//             type="submit"
//             colorScheme="green"
//             mt={2}
//             isLoading={isSubmitting}
//           >
//             Register
//           </Button>

//           {/* Already have an account */}
//           <Text fontSize="sm" textAlign="center" mt={2}>
//             Already have an account?{" "}
//             <Link to="/login" style={{ color: "#2f855a", fontWeight: "500" }}>
//               Login here
//             </Link>
//           </Text>
//         </Flex>
//       </form>
//     </AuthCard>
//   );
// };

// export default RegisterPage;



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

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  // Switch language
  const switchLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);

    // Update text direction for Arabic vs English
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
      // Map backend errors to form fields
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
    <AuthCard
      title={t("joinAcademy")}
      subtitle={t("createAccount")}
    >
      {/* Language Switch Button */}
      <Flex justify="flex-end">
        <Button size="sm" variant="outline" onClick={switchLanguage}>
          {i18n.language === "en" ? "العربية" : "English"}
        </Button>
      </Flex>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={4}>

          {/* First + Last Name */}
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

          {/* Email */}
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

          {/* Password */}
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

          {/* Role */}
          <FormControl isInvalid={errors.role}>
            <FormLabel fontSize="sm">{t("role")}</FormLabel>
            <Select placeholder={t("selectRole")} bg="gray.50" {...register("role")}>
              <option value="admin">{t("admin")}</option>
              <option value="player">{t("player")}</option>
              <option value="agent">{t("agent")}</option>
            </Select>
            <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
          </FormControl>

          {/* Submit button */}
          <Button
            type="submit"
            colorScheme="green"
            mt={2}
            isLoading={isSubmitting}
          >
            {t("register")}
          </Button>

          {/* Already have an account */}
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
