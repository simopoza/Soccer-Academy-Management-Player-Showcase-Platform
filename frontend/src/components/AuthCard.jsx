import { Box, Flex, Circle, Text, Stack } from "@chakra-ui/react";

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgGradient="linear(to-b, green.50, white)"
      p={4}
    >
      <Box
        w="full"
        maxW="450px"
        bg="white"
        borderRadius="lg"
        boxShadow="lg"
        p={8}
        textAlign="center"
      >
        {/* Logo */}
        <Circle size="60px" bg="green.500" mx="auto" mb={4}>
          {/* Placeholder icon */}
          <Text fontSize="2xl" color="white">⚽</Text>
        </Circle>
        {/* Title + Subtitle */}
        <Stack>
          <Text fontSize="xl" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {subtitle}
          </Text>
        </Stack>
        {/* The children (form fields) */}
        {children}
      </Box>
    </Flex>
  );
};

export default AuthCard;