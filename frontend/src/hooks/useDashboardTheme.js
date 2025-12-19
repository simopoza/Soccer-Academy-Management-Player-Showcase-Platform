import { useColorModeValue } from "@chakra-ui/react";
import {
  PRIMARY_GREEN,
  CARD_BG_LIGHT,
  CARD_BG_DARK,
  CARD_BORDER_LIGHT,
  CARD_BORDER_DARK,
  TITLE_COLOR_LIGHT,
  TITLE_COLOR_DARK,
  TEXT_COLOR_LIGHT,
  TEXT_COLOR_DARK,
  PAGE_BG_LIGHT,
} from "../theme/colors";

export const useDashboardTheme = () => {
  const bgGradient = useColorModeValue("linear(to-b, green.50, white)", "linear(to-b, gray.900, gray.800)");
  const headingColor = useColorModeValue(PRIMARY_GREEN, "green.300");
  const textColor = useColorModeValue(TEXT_COLOR_LIGHT, TEXT_COLOR_DARK);
  const cardBg = useColorModeValue(CARD_BG_LIGHT, CARD_BG_DARK);
  const cardBorder = useColorModeValue(CARD_BORDER_LIGHT, CARD_BORDER_DARK);
  const cardShadow = useColorModeValue(
    "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
  );
  const chartGridColor = useColorModeValue("#E5E7EB", "#374151");
  const titleColor = useColorModeValue(TITLE_COLOR_LIGHT, TITLE_COLOR_DARK);

  return {
    bgGradient,
    headingColor,
    textColor,
    cardBg,
    cardBorder,
    cardShadow,
    chartGridColor,
    titleColor,
    primaryGreen: PRIMARY_GREEN,
  };
};
