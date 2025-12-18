import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Text,
  Icon,
} from "@chakra-ui/react";

const StatsCard = ({ stat, cardBg, cardBorder, cardShadow, primaryGreen, textColor }) => (
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
          {stat.label}
        </Text>
        <Icon
          as={stat.icon}
          boxSize={5}
          color={stat.color}
        />
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
        {stat.value}
      </Text>
      <Text 
        fontSize="sm" 
        fontWeight="400"
        color={textColor}
        lineHeight="20px"
      >
        {stat.change}
      </Text>
    </CardBody>
  </Card>
);

export default StatsCard;
