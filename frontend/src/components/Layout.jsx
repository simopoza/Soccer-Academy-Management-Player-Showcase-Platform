import { Box } from "@chakra-ui/react";
import Header from "./Header";

const Layout = ({ children, pageTitle, pageSubtitle }) => {
  return (
    <Box>
      <Header pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
      <Box>{children}</Box>
    </Box>
  );
};

export default Layout;
