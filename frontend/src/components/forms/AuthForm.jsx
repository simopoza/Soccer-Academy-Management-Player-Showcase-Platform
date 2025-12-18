import { Flex, FormControl, FormLabel, Input, Select, Button, Text, FormErrorMessage, HStack, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ThemeToggle from "../ui/ThemeToggle";

const AuthForm = ({
  title,
  subtitle,
  fields,
  onSubmit,
  isSubmitting,
  switchLanguage,
  isArabic,
  bottomText,
  bottomLink,
  bottomLinkText,
  buttonText,
  forgotPasswordLink, // New prop
}) => {
  // Color mode values
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const placeholderColor = useColorModeValue("gray.400", "gray.400");
  const langBtnColor = useColorModeValue("gray.800", "white");

  return (
    <Flex direction="column" gap={4}>
      {/* Language switch button and Theme toggle */}
      <Flex justify="flex-end" mb={4}>
        <HStack spacing={2}>
          <ThemeToggle />
          <Button size="sm" variant="outline" color={langBtnColor} onClick={switchLanguage}>
            {isArabic ? "English" : "العربية"}
          </Button>
        </HStack>
      </Flex>

      {/* Form */}
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap={4}>
          {fields.map((field) => {
            if (field.type === "hstack") {
              // For first_name & last_name layout
              return (
                <HStack key={field.name} spacing={4}>
                  {field.inputs.map((input) => (
                    <FormControl key={input.name} isInvalid={input.error}>
                      <FormLabel fontSize="sm">{input.label}</FormLabel>
                      {input.component === "select" ? (
                        <Select placeholder={input.placeholder} bg={inputBg} {...input.register}>
                          {input.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          placeholder={input.placeholder}
                          bg={inputBg}
                          _placeholder={{ color: placeholderColor }}
                          type={input.type || "text"}
                          {...input.register}
                        />
                      )}
                      <FormErrorMessage>{input.error?.message}</FormErrorMessage>
                    </FormControl>
                  ))}
                </HStack>
              );
            }

            return (
              <FormControl key={field.name} isInvalid={field.error}>
                <FormLabel fontSize="sm">{field.label}</FormLabel>
                {field.component === "select" ? (
                  <Select placeholder={field.placeholder} bg={inputBg} {...field.register}>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    bg={inputBg}
                    _placeholder={{ color: placeholderColor }}
                    type={field.type || "text"}
                    {...field.register}
                  />
                )}
                <FormErrorMessage>{field.error?.message}</FormErrorMessage>
              </FormControl>
            );
          })}

          {/* Forgot Password Link - only for login */}
          {forgotPasswordLink && (
            <Text fontSize="sm" textAlign="right" mt={-2}>
              <Link to="/forgot-password" style={{ color: "#2563eb", fontWeight: "500" }}>
                {forgotPasswordLink}
              </Link>
            </Text>
          )}

          <Button type="submit" colorScheme="green" mt={2} isLoading={isSubmitting}>
            {buttonText}
          </Button>

          {bottomText && bottomLink && bottomLinkText && (
            <Text fontSize="sm" textAlign="center" mt={2}>
              {bottomText}{" "}
              <Link to={bottomLink} style={{ color: "#2f855a", fontWeight: "500" }}>
                {bottomLinkText}
              </Link>
            </Text>
          )}
        </Flex>
      </form>
    </Flex>
  );
};

export default AuthForm;
