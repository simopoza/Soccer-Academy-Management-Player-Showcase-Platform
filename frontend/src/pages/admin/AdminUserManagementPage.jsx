import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  useToast,
  Spinner,
  Center,
  HStack,
  IconButton,
  Tooltip,
  Container,
  Card,
  CardHeader,
  CardBody,
  Stack,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useDashboardTheme } from '../../hooks/useDashboardTheme';
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";

const AdminUserManagementPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const isRTL = i18n.language === "ar";

  const { bgGradient } = useDashboardTheme();

  // Fetch pending users on component mount
  const fetchPendingUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingUsers();
      setPendingUsers(data.users || []);
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.response?.data?.message || "Failed to fetch pending users",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (userId, userName) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: "approving" }));

      await adminService.approveUser(userId);

      toast({
        title: t("success") || "Success",
        description: `${userName} has been approved successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Remove approved user from list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.response?.data?.message || "Failed to approve user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const handleReject = async (userId, userName) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: "rejecting" }));

      await adminService.rejectUser(userId);

      toast({
        title: t("success") || "Success",
        description: `${userName} has been rejected`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });

      // Remove rejected user from list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.response?.data?.message || "Failed to reject user",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "player":
        return "green";
      case "agent":
        return "blue";
      case "admin":
        return "purple";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Center minH="80vh">
        <Spinner size="xl" color="green.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      py={8}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Container maxW="container.xl">
        <Card boxShadow="lg" borderRadius="lg">
          <CardHeader bg="green.500" borderTopRadius="lg" py={6}>
            <Flex justify="space-between" align="center">
              <HStack spacing={4}>
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => navigate("/admin/menu")}
                  aria-label="Back to menu"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: "green.600" }}
                  size="lg"
                />
                <Stack spacing={2}>
                  <Heading size="lg" color="white">
                    ⚽ {t("userManagement") || "User Management"}
                  </Heading>
                  <Text color="green.50" fontSize="sm">
                    {t("pendingUsersSubtitle") || "Review and approve pending user registrations"}
                  </Text>
                </Stack>
              </HStack>
              <Badge
                colorScheme="yellow"
                fontSize="lg"
                px={4}
                py={2}
                borderRadius="full"
              >
                {pendingUsers.length} {t("pending") || "Pending"}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            {pendingUsers.length === 0 ? (
              <Center py={16}>
                <Stack spacing={4} align="center">
                  <Text fontSize="6xl">✅</Text>
                  <Heading size="md" color="gray.600">
                    {t("noPendingUsers") || "No Pending Users"}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    {t("allUsersProcessed") || "All user registrations have been processed"}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>{t("id") || "ID"}</Th>
                      <Th>{t("name") || "Name"}</Th>
                      <Th>{t("email") || "Email"}</Th>
                      <Th>{t("role") || "Role"}</Th>
                      <Th>{t("status") || "Status"}</Th>
                      <Th textAlign="center">{t("actions") || "Actions"}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingUsers.map((user) => (
                      <Tr key={user.id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="medium">{user.id}</Td>
                        <Td>
                          <Text fontWeight="bold">
                            {user.first_name} {user.last_name}
                          </Text>
                        </Td>
                        <Td>{user.email}</Td>
                        <Td>
                          <Badge
                            colorScheme={getRoleBadgeColor(user.role)}
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {user.role.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="yellow" fontSize="sm" px={3} py={1} borderRadius="full">
                            {user.status.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack justify="center" spacing={2}>
                            <Tooltip label={t("approve") || "Approve"} hasArrow>
                              <IconButton
                                aria-label="Approve user"
                                icon={<CheckIcon />}
                                colorScheme="green"
                                size="sm"
                                isLoading={actionLoading[user.id] === "approving"}
                                isDisabled={actionLoading[user.id]}
                                onClick={() =>
                                  handleApprove(user.id, `${user.first_name} ${user.last_name}`)
                                }
                              />
                            </Tooltip>
                            <Tooltip label={t("reject") || "Reject"} hasArrow>
                              <IconButton
                                aria-label="Reject user"
                                icon={<CloseIcon />}
                                colorScheme="red"
                                size="sm"
                                isLoading={actionLoading[user.id] === "rejecting"}
                                isDisabled={actionLoading[user.id]}
                                onClick={() =>
                                  handleReject(user.id, `${user.first_name} ${user.last_name}`)
                                }
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Refresh Button */}
        <Flex justify="center" mt={6}>
          <Button
            colorScheme="green"
            onClick={fetchPendingUsers}
            isLoading={loading}
            leftIcon={<Text>🔄</Text>}
          >
            {t("refresh") || "Refresh"}
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default AdminUserManagementPage;
