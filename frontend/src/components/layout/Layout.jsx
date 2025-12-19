import { Box, Flex } from "@chakra-ui/react";
import Header from "../layout/Header";
import FixedSidebar from "../layout/FixedSidebar";
import { useTranslation } from "react-i18next";
import { useDashboardTheme } from "../../hooks/useDashboardTheme";

const Layout = ({ children, pageTitle, pageSubtitle }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { bgGradient } = useDashboardTheme();

  return (
    <Flex>
      {/* Fixed Sidebar - Desktop only */}
      <FixedSidebar />

      {/* Main Content Area */}
      <Box
        flex="1"
        ml={{ base: 0, lg: isRTL ? 0 : "260px" }}
        mr={{ base: 0, lg: isRTL ? "260px" : 0 }}
        bg={bgGradient}
        minH="100vh"
      >
        <Header pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <Box>{children}</Box>
      </Box>
    </Flex>
  );
};

export default Layout;
