import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header";
import FixedSidebar from "./FixedSidebar";
import { useTranslation } from "react-i18next";

const Layout = ({ children, pageTitle, pageSubtitle }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <Flex>
      {/* Fixed Sidebar - Desktop only */}
      <FixedSidebar />

      {/* Main Content Area */}
      <Box
        flex="1"
        ml={{ base: 0, lg: isRTL ? 0 : "260px" }}
        mr={{ base: 0, lg: isRTL ? "260px" : 0 }}
      >
        <Header pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <Box>{children}</Box>
      </Box>
    </Flex>
  );
};

export default Layout;
