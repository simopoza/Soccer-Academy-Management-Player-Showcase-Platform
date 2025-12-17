// Utility functions for AdminDashboardPage

export const getStatusColor = (status) => {
  switch (status) {
    case "Won":
      return "#00B050";
    case "Draw":
      return "#E5E7EB";
    case "Lost":
      return "#E11D48";
    default:
      return "#E5E7EB";
  }
};

export const getStatusTextColor = (status) => {
  switch (status) {
    case "Won":
      return "#FFFFFF";
    case "Draw":
      return "#374151";
    case "Lost":
      return "#FFFFFF";
    default:
      return "#374151";
  }
};

export const getStatusText = (status, t) => {
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
