import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from "../../components/layout/Layout";
import StatsCard from "../../components/ui/StatsCard";
import { StatsCardsSkeleton, ChartAndTableSkeleton } from "../../components/ui/DashboardSkeleton";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { useDashboardTheme } from "../../hooks/useDashboardTheme";
import { useStatsCards } from "../../hooks/useStatsCards";
import {
  getStatusColor,
  getStatusTextColor,
  getStatusText,
} from "../../utils/dashboardUtils";
import { useAuth } from "../../context/AuthContext";

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === "ar";

  // Custom hooks
  const { stats, recentMatches, performanceData, loading, error, errorMessage } = useAdminDashboard();
  const { bgGradient, textColor, cardBg, cardBorder, cardShadow, chartGridColor, titleColor, primaryGreen } = useDashboardTheme();
  const statsCards = useStatsCards(stats, t, primaryGreen);



  return (
    <Layout 
      pageTitle={t("dashboard") || "Dashboard"}
      pageSubtitle={`Welcome back, ${user?.first_name || ''}`}
    >
      <Box minH="100vh" bg={bgGradient} p={6} dir={isRTL ? "rtl" : "ltr"}>
        <Container maxW="full" px={0}>

          {/* Loading State with Skeletons */}
          {loading && (
            <>
              <StatsCardsSkeleton cardBg={cardBg} cardBorder={cardBorder} cardShadow={cardShadow} />
              <ChartAndTableSkeleton cardBg={cardBg} cardBorder={cardBorder} cardShadow={cardShadow} />
            </>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert status="error" borderRadius="md" mb={4}>
              <AlertIcon />
              {errorMessage}
            </Alert>
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                {statsCards.map((stat, index) => (
                  <StatsCard
                    key={index}
                    stat={stat}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    cardShadow={cardShadow}
                    primaryGreen={primaryGreen}
                    textColor={textColor}
                  />
                ))}
              </SimpleGrid>

          {/* Performance Chart and Recent Matches - Side by Side */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Performance Ratings Chart */}
            <Card 
              bg={cardBg} 
              borderColor={cardBorder} 
              borderWidth="1px" 
              boxShadow={cardShadow} 
              borderRadius="xl"
              p={6}
              minH="360px"
            >
              <CardHeader p={0} pb={4}>
                <Heading 
                  fontSize="lg" 
                  fontWeight="600" 
                  color={titleColor} 
                  mb={1}
                  lineHeight="24px"
                >
                  {t("performanceRatings") || "Performance Ratings"}
                </Heading>
                <Text 
                  color={textColor} 
                  fontSize="sm"
                  fontWeight="400"
                  lineHeight="20px"
                >
                  {t("averageTeamRatings") || "Average team ratings over time"}
                </Text>
              </CardHeader>
              <CardBody p={0}>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00B050" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#00B050" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis 
                        dataKey="name" 
                        stroke={textColor}
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke={textColor}
                        style={{ fontSize: '12px' }}
                        domain={[0, 10]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: cardBg,
                          border: `1px solid ${cardBorder}`,
                          borderRadius: '8px',
                          color: titleColor
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#00B050" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRating)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    minH="350px"
                    color={textColor}
                    fontSize="sm"
                  >
                    {t("noPerformanceData") || "No performance data available yet"}
                  </Flex>
                )}
              </CardBody>
            </Card>

            {/* Recent Matches */}
            <Card 
              bg={cardBg} 
              borderColor={cardBorder} 
              borderWidth="1px" 
              boxShadow={cardShadow} 
              borderRadius="xl"
              minH="360px"
            >
              <CardHeader p={6} pb={4}>
                <Heading 
                  fontSize="lg" 
                  fontWeight="600" 
                  color={titleColor} 
                  mb={1}
                  lineHeight="24px"
                >
                  {t("recentMatches") || "Recent Matches"}
                </Heading>
                <Text 
                  color={textColor} 
                  fontSize="sm"
                  fontWeight="400"
                  lineHeight="20px"
                >
                  {t("latestMatchResults") || "Latest match results"}
                </Text>
              </CardHeader>
              <CardBody p={0}>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>{t("teams") || "Teams"}</Th>
                        <Th>{t("score") || "Score"}</Th>
                        <Th>{t("date") || "Date"}</Th>
                        <Th>{t("result") || "Result"}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentMatches.map((match) => (
                        <Tr key={match.id}>
                          <Td>
                            <Box>
                              <Text 
                                fontWeight="500" 
                                fontSize="sm" 
                                color={titleColor}
                                lineHeight="20px"
                              >
                                {match.team1}
                              </Text>
                              <Text 
                                fontSize="sm" 
                                fontWeight="400"
                                color={textColor}
                                lineHeight="20px"
                              >
                                {match.team2}
                              </Text>
                            </Box>
                          </Td>
                          <Td 
                            fontWeight="500" 
                            fontSize="sm" 
                            color={titleColor}
                          >
                            {match.score}
                          </Td>
                          <Td 
                            fontSize="sm" 
                            fontWeight="400"
                            color={textColor}
                          >
                            {match.date}
                          </Td>
                          <Td>
                            <Badge
                              px={3}
                              py={1}
                              borderRadius="full"
                              minW="70px"
                              textAlign="center"
                              bg={getStatusColor(match.status)}
                              color={getStatusTextColor(match.status)}
                              fontWeight="500"
                              fontSize="xs"
                              h="24px"
                              display="inline-flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              {getStatusText(match.status, t)}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>
            </>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default AdminDashboardPage;
