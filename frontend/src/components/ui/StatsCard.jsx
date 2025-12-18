import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Text,
  Icon,
} from "@chakra-ui/react";

const StatsCard = ({ stat, title, value, icon, color, change, cardBg, cardBorder, cardShadow, primaryGreen, textColor }) => {
  // Support two shapes: either a single `stat` object, or individual props.
  const s = stat || { label: title, value, icon, color, change };

  // Safe defaults
  const safeLabel = s?.label ?? '';
  const SafeIcon = s?.icon ?? null;
  const safeValue = s?.value ?? 0;
  const safeColor = s?.color ?? 'gray.500';
  const safeChange = s?.change ?? '';

  return (
    <Card
      bg={cardBg}
      borderColor={cardBorder}
      borderWidth="1px"
      boxShadow={cardShadow}
      borderRadius="xl"
      p={6}
      minH="120px"
      _hover={{ transform: "translateY(-2px)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
      transition="all 0.2s"
    >
      <CardHeader p={0} pb={3}>
        <Flex justify="space-between" align="center">
          <Text 
            fontSize="sm" 
            fontWeight="500" 
            color={textColor}
            lineHeight="20px"
          >
            {safeLabel}
          </Text>
          {SafeIcon && (
            <Icon
              as={SafeIcon}
              boxSize={5}
              color={safeColor}
            />
          )}
        </Flex>
      </CardHeader>
      <CardBody p={0}>
        <Text 
          fontSize="2xl" 
          fontWeight="600" 
          color={primaryGreen} 
          mb={2}
          lineHeight="28px"
        >
          {safeValue}
        </Text>
        <Text 
          fontSize="sm" 
          fontWeight="400"
          color={textColor}
          lineHeight="20px"
        >
          {safeChange}
        </Text>
      </CardBody>
    </Card>
  );
};

export default StatsCard;
