import { Flex, FormControl, FormLabel, Input, Select, Button, Text, FormErrorMessage, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";

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
  return (
    <Flex direction="column" gap={4}>
      {/* Language switch button */}
      <Flex justify="flex-end" mb={4}>
        <Button size="sm" variant="outline" onClick={switchLanguage}>
          {isArabic ? "English" : "العربية"}
        </Button>
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
                        <Select placeholder={input.placeholder} bg="gray.50" {...input.register}>
                          {input.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          placeholder={input.placeholder}
                          bg="gray.50"
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
                  <Select placeholder={field.placeholder} bg="gray.50" {...field.register}>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    bg="gray.50"
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
