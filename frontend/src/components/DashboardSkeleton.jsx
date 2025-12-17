import { Box, SimpleGrid, Skeleton, SkeletonText } from "@chakra-ui/react";

export const StatsCardsSkeleton = ({ cardBg, cardBorder, cardShadow }) => (
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
    {[...Array(3)].map((_, idx) => (
      <Box
        key={idx}
        p={6}
        borderRadius="xl"
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        boxShadow={cardShadow}
      >
        <Skeleton height="20px" width="40%" mb={3} />
        <Skeleton height="32px" width="60%" mb={2} />
        <Skeleton height="20px" width="50%" />
      </Box>
    ))}
  </SimpleGrid>
);

export const ChartAndTableSkeleton = ({ cardBg, cardBorder, cardShadow }) => (
  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
    {/* Chart Skeleton */}
    <Box
      p={6}
      borderRadius="xl"
      bg={cardBg}
      borderWidth="1px"
      borderColor={cardBorder}
      boxShadow={cardShadow}
      minH="360px"
    >
      <Skeleton height="24px" width="40%" mb={2} />
      <SkeletonText mt="4" noOfLines={10} spacing="4" skeletonHeight="20px" />
    </Box>
    {/* Table Skeleton */}
    <Box
      p={6}
      borderRadius="xl"
      bg={cardBg}
      borderWidth="1px"
      borderColor={cardBorder}
      boxShadow={cardShadow}
      minH="360px"
    >
      <Skeleton height="24px" width="40%" mb={2} />
      <Skeleton height="20px" width="60%" mb={4} />
      {[...Array(5)].map((_, idx) => (
        <Skeleton key={idx} height="20px" mb={3} />
      ))}
    </Box>
  </SimpleGrid>
);
