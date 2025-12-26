import { Box, Container, Heading, Text, Stack, Card, CardBody } from "@chakra-ui/react";
import { useDashboardTheme } from "../../hooks/useDashboardTheme";
import { useTranslation } from "react-i18next";

const AdminAnalyticsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { bgGradient } = useDashboardTheme();

import { Navigate } from 'react-router-dom';

// AdminAnalyticsPage removed — redirect to stats management
const AdminAnalyticsPage = () => {
  return <Navigate to="/admin/stats-management" replace />;
};

export default AdminAnalyticsPage;
