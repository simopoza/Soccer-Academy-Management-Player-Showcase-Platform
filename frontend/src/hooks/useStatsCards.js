import { useMemo } from "react";
import { FiUsers, FiAward, FiCalendar } from "react-icons/fi";

export const useStatsCards = (stats, t, primaryGreen) => {
  return useMemo(
    () =>
      stats
        ? [
            {
              label: t("totalPlayers") || "Total Players",
              value: stats.totalPlayers,
              change: `${stats.playerGrowth} ${t("fromLastMonth") || "from last month"}`,
              icon: FiUsers,
              color: primaryGreen,
            },
            {
              label: t("activeTeams") || "Active Teams",
              value: stats.activeTeams,
              change: t("acrossAllAgeGroups") || "Across all age groups",
              icon: FiAward,
              color: primaryGreen,
            },
            {
              label: t("matchesPlayed") || "Matches Played",
              value: stats.matchesPlayed,
              change: t("thisSeason") || "This season",
              icon: FiCalendar,
              color: primaryGreen,
            },
          ]
        : [],
    [stats, t, primaryGreen]
  );
};
