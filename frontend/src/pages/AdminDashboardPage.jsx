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
  Icon,
  Flex,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { FaUsers, FaUserShield, FaFutbol } from "react-icons/fa";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from "../components/Layout";
import axiosInstance from "../services/axiosInstance";

const AdminDashboardPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // State for data
  const [stats, setStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-b, green.50, white)",
    "linear(to-b, gray.900, gray.800)"
  );
  const headingColor = useColorModeValue("green.700", "green.300");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorder = useColorModeValue("green.100", "gray.600");
  const chartGridColor = useColorModeValue("#e5e7eb", "#374151");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats, matches, and performance ratings in parallel
        const [statsResponse, matchesResponse, ratingsResponse] = await Promise.all([
          axiosInstance.get('/dashboard/stats'),
          axiosInstance.get('/dashboard/recent-matches?limit=5'),
          axiosInstance.get('/dashboard/performance-ratings?months=6'),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        if (matchesResponse.data.success) {
          setRecentMatches(matchesResponse.data.data);
        }

        if (ratingsResponse.data.success) {
          setPerformanceData(ratingsResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats card configuration
  const statsCards = stats ? [
    {
      label: t("totalPlayers") || "Total Players",
      value: stats.totalPlayers,
      change: `${stats.playerGrowth} ${t("fromLastMonth") || "from last month"}`,
      icon: FaUsers,
      color: "green",
    },
    {
      label: t("activeTeams") || "Active Teams",
      value: stats.activeTeams,
      change: t("acrossAllAgeGroups") || "Across all age groups",
      icon: FaUserShield,
      color: "blue",
    },
    {
      label: t("matchesPlayed") || "Matches Played",
      value: stats.matchesPlayed,
      change: t("thisSeason") || "This season",
      icon: FaFutbol,
      color: "purple",
    },
  ] : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Won":
        return "green";
      case "Draw":
        return "gray";
      case "Lost":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Won":
        return t("won") || "Won";
      case "Draw":
        return t("draw") || "Draw";
      case "Lost":
        return t("lost") || "Lost";
      default:
        return status;
    }
  };

  return (
    <Layout pageTitle={t("adminDashboard") || "Admin Dashboard"}>
      <Box minH="100vh" bgGradient={bgGradient} py={8} px={4} dir={isRTL ? "rtl" : "ltr"}>
        <Container maxW="full">
          {/* Loading State */}
          {loading && (
            <Flex justify="center" align="center" minH="400px">
              <Spinner size="xl" color="green.500" thickness="4px" />
            </Flex>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert status="error" borderRadius="md" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Stats Cards */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, lg: 6 }} mb={{ base: 4, lg: 6 }}>
                {statsCards.map((stat, index) => (
              <Card
                key={index}
                bg={cardBg}
                borderColor={cardBorder}
                borderWidth="1px"
                boxShadow="lg"
                _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
                transition="all 0.3s"
              >
                <CardHeader pb={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="md" fontWeight="medium" color={textColor}>
                      {stat.label}
                    </Text>
                    <Icon
                      as={stat.icon}
                      boxSize={5}
                      color={`${stat.color}.600`}
                    />
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                  <Text fontSize="4xl" fontWeight="bold" color={headingColor} mb={2}>
                    {stat.value}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    {stat.change}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Performance Chart and Recent Matches - Side by Side */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, lg: 6 }}>
            {/* Performance Ratings Chart */}
            <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="lg">
              <CardHeader py={5}>
                <Heading size="md" color={headingColor} mb={1}>
                  {t("performanceRatings") || "Performance Ratings"}
                </Heading>
                <Text color={textColor} fontSize="sm">
                  {t("averageTeamRatings") || "Average team ratings over time"}
                </Text>
              </CardHeader>
              <CardBody>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                          color: textColor
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#10b981" 
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
            <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" boxShadow="lg">
              <CardHeader py={5}>
                <Heading size="md" color={headingColor} mb={1}>
                  {t("recentMatches") || "Recent Matches"}
                </Heading>
                <Text color={textColor} fontSize="sm">
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
                              <Text fontWeight="normal" fontSize="sm">
                                {match.team1}
                              </Text>
                              <Text fontSize="sm" color={textColor}>
                                {match.team2}
                              </Text>
                            </Box>
                          </Td>
                          <Td fontWeight="normal" fontSize="sm">{match.score}</Td>
                          <Td fontSize="sm" color={textColor}>{match.date}</Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(match.status)}
                              px={3}
                              py={1}
                              borderRadius="md"
                              minW="70px"
                              textAlign="center"
                              bgGradient={
                                match.status === "Won" 
                                  ? "linear(to-r, green.600, green.700)" 
                                  : match.status === "Lost"
                                  ? "linear(to-r, red.600, red.700)"
                                  : match.status === "Draw"
                                  ? "linear(to-r, gray.500, gray.600)"
                                  : undefined
                              }
                              color={
                                match.status === "Won" || match.status === "Lost" || match.status === "Draw"
                                  ? "white" 
                                  : undefined
                              }
                            >
                              {getStatusText(match.status)}
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
