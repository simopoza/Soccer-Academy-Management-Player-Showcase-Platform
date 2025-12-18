import {
	Box,
	Flex,
	VStack,
	HStack,
	IconButton,
	Text,
	Avatar,
	Divider,
	Button,
	Drawer,
	DrawerBody,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	useDisclosure,
	useColorModeValue,
	Tooltip,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../ui/ThemeToggle";
import useLanguageSwitcher from "../../hooks/useLanguageSwitcher";

const Sidebar = ({ children }) => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { t, i18n } = useTranslation();
	const { switchLanguage, isArabic } = useLanguageSwitcher();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const isRTL = i18n.language === "ar";

	// Color mode values
	const sidebarBg = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.700");
	const activeBg = useColorModeValue("green.50", "green.900");
	const activeColor = useColorModeValue("green.600", "green.200");
	const hoverBg = useColorModeValue("gray.50", "gray.700");
	const textColor = useColorModeValue("gray.700", "gray.200");

	// Navigation items based on role
	const getNavigationItems = () => {
		if (!user?.role) return [];
    
		switch (user.role) {
			case "admin":
				return [
					{ name: t("dashboard") || "Dashboard", icon: "🏠", path: "/admin/dashboard" },
					{ name: t("userManagement") || "Users Management", icon: "👥", path: "/admin/users" },
					{ name: t("playersManagement") || "Players", icon: "⚽", path: "/admin/players", disabled: true },
					{ name: t("teamsManagement") || "Teams", icon: "🏆", path: "/admin/teams", disabled: true },
					{ name: t("matchesManagement") || "Matches", icon: "📅", path: "/admin/matches", disabled: true },
					{ name: t("analyticsReports") || "Analytics", icon: "📊", path: "/admin/analytics" },
					{ name: t("settings") || "Settings", icon: "⚙️", path: "/admin/settings" },
				];
			case "player":
				return [
					{ name: t("dashboard") || "Dashboard", icon: "🏠", path: "/player/dashboard" },
					{ name: t("myProfile") || "My Profile", icon: "👤", path: "/player/profile", disabled: true },
					{ name: t("myStats") || "My Stats", icon: "📊", path: "/player/stats", disabled: true },
					{ name: t("myTeam") || "My Team", icon: "🏆", path: "/player/team", disabled: true },
					{ name: t("settings") || "Settings", icon: "⚙️", path: "/player/settings" },
				];
			case "agent":
				return [
					{ name: t("dashboard") || "Dashboard", icon: "🏠", path: "/agent/dashboard" },
					{ name: t("myPlayers") || "My Players", icon: "⚽", path: "/agent/players", disabled: true },
					{ name: t("contracts") || "Contracts", icon: "📋", path: "/agent/contracts", disabled: true },
					{ name: t("settings") || "Settings", icon: "⚙️", path: "/agent/settings" },
				];
			default:
				return [];
		}
	};

	const navigationItems = getNavigationItems();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
		onClose();
	};

	const handleNavigation = (path, disabled) => {
		if (!disabled) {
			navigate(path);
			onClose();
		}
	};

	const SidebarContent = () => (
		<Flex direction="column" h="full" bg={sidebarBg}>
			{/* Logo / Brand */}
			<Box p={6} borderBottom="1px" borderColor={borderColor}>
				<HStack spacing={3}>
					<Text fontSize="3xl">⚽</Text>
					<Box>
						<Text fontSize="lg" fontWeight="bold" color={activeColor}>
							{t("soccerAcademy") || "Soccer Academy"}
						</Text>
						<Text fontSize="xs" color={textColor}>
							{t("management") || "Management System"}
						</Text>
					</Box>
				</HStack>
			</Box>

			{/* User Profile Section */}
			<Box p={4} borderBottom="1px" borderColor={borderColor}>
				<HStack spacing={3}>
					<Avatar size="md" name={`${user?.first_name} ${user?.last_name}`} bg="green.500" />
					<Box flex={1}>
						<Text fontSize="sm" fontWeight="bold" noOfLines={1}>
							{user?.first_name} {user?.last_name}
						</Text>
						<Text fontSize="xs" color={textColor} textTransform="capitalize">
							{user?.role}
						</Text>
					</Box>
				</HStack>
			</Box>

			{/* Navigation Items */}
			<VStack flex={1} spacing={1} p={4} align="stretch" overflowY="auto">
				{navigationItems.map((item, index) => {
					const isActive = location.pathname === item.path;
					return (
						<Tooltip
							key={index}
							label={item.disabled ? t("comingSoon") || "Coming Soon" : ""}
							placement="right"
							isDisabled={!item.disabled}
						>
							<Button
								w="full"
								justifyContent="flex-start"
								variant="ghost"
								leftIcon={<Text fontSize="lg">{item.icon}</Text>}
								bg={isActive ? activeBg : "transparent"}
								color={isActive ? activeColor : textColor}
								_hover={{ bg: item.disabled ? "transparent" : hoverBg }}
								onClick={() => handleNavigation(item.path, item.disabled)}
								opacity={item.disabled ? 0.5 : 1}
								cursor={item.disabled ? "not-allowed" : "pointer"}
								fontWeight={isActive ? "bold" : "normal"}
							>
								{item.name}
							</Button>
						</Tooltip>
					);
				})}
			</VStack>

			<Divider />

			{/* Footer Controls */}
			<VStack spacing={2} p={4}>
				<HStack w="full" spacing={2}>
					<ThemeToggle size="sm" variant="outline" />
					<Button
						flex={1}
						size="sm"
						variant="outline"
						onClick={switchLanguage}
						color={textColor}
					>
						{isArabic ? "English" : "العربية"}
					</Button>
				</HStack>
				<Button
					w="full"
					size="sm"
					colorScheme="red"
					variant="outline"
					onClick={handleLogout}
					leftIcon={<Text>🚪</Text>}
				>
					{t("logout") || "Logout"}
				</Button>
			</VStack>
		</Flex>
	);

	return (
		<>
			{/* Hamburger Menu Button - Fixed position */}
			<IconButton
				icon={<HamburgerIcon />}
				position="fixed"
				top={4}
				left={isRTL ? "auto" : 4}
				right={isRTL ? 4 : "auto"}
				zIndex={1000}
				onClick={onOpen}
				aria-label="Open menu"
				variant="outline"
				bg={useColorModeValue("white", "gray.800")}
				_hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
				boxShadow="md"
			/>

			{/* Sidebar Drawer */}
			<Drawer 
				isOpen={isOpen} 
				placement={isRTL ? "right" : "left"} 
				onClose={onClose}
				size="xs"
			>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerCloseButton />
					<DrawerBody p={0}>
						<SidebarContent />
					</DrawerBody>
				</DrawerContent>
			</Drawer>

			{/* Main Content */}
			<Box>
				{children}
			</Box>
		</>
	);
};

export default Sidebar;

