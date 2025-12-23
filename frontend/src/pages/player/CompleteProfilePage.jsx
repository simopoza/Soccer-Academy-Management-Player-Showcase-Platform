import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Grid,
  Avatar,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../../components/ui/ThemeToggle";
import useLanguageSwitcher from "../../hooks/useLanguageSwitcher";
import playerService from "../../services/playerService";
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

const CompleteProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const isRTL = i18n.language === "ar";
  const { switchLanguage, isArabic } = useLanguageSwitcher();

  const [teams, setTeams] = useState([]);
  const [playerId, setPlayerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    date_of_birth: "",
    team_id: "",
    position: "",
    height: "",
    weight: "",
    strong_foot: "",
    image_url: "",
  });

  // Color mode values
  // const bgGradient = useColorModeValue(
  //   "linear(to-b, green.50, white)",
  //   "linear(to-b, gray.900, gray.800)"
  // );
  // const cardBg = useColorModeValue("white", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.600");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const headerBg = useColorModeValue("green.500", "green.600");
  const { bgGradient, cardBg } = useDashboardTheme();

  // Fetch teams and player info on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, playerData] = await Promise.all([
          playerService.getTeams(),
          playerService.getCurrentPlayer(),
        ]);
        setTeams(teamsData || []);
        setPlayerId(playerData.id);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: t("error") || "Error",
          description: "Failed to load required data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchData();
  }, []);

  // Check if profile already completed - redirect to dashboard
  useEffect(() => {
    if (user?.profile_completed) {
      navigate("/player/dashboard");
    }
  }, [user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.date_of_birth || !formData.team_id || !formData.position || !formData.height || !formData.weight || !formData.strong_foot) {
      setError(t("fillAllFields") || "Please fill in all required fields");
      return;
    }

    // Check if we have player ID
    if (!playerId) {
      setError("Player information not loaded. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);

      await playerService.completeProfile(playerId, {
        date_of_birth: formData.date_of_birth,
        team_id: parseInt(formData.team_id),
        position: formData.position,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        strong_foot: formData.strong_foot,
        image_url: formData.image_url || null,
      });

      // Update user context
      updateUser({ profile_completed: true });

      toast({
        title: t("success") || "Success",
        description: t("profileCompleted") || "Profile completed successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/player/dashboard");
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || t("somethingWrong") || "Something went wrong");
      toast({
        title: t("error") || "Error",
        description: error.response?.data?.message || t("somethingWrong") || "Failed to complete profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (user?.profile_completed) {
    return null;
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient} py={8} dir={isRTL ? "rtl" : "ltr"}>
      <Container maxW="container.sm">
        <Card boxShadow="xl" borderRadius="lg" overflow="hidden" bg={cardBg}>
          <CardHeader bg={headerBg} textAlign="center" py={6} position="relative">
            <Flex position="absolute" top={4} right={4} gap={2}>
              <ThemeToggle />
              <Button size="sm" variant="outline" color="white" onClick={switchLanguage}>
                {isArabic ? "English" : "العربية"}
              </Button>
            </Flex>
            
            <Flex justify="center" mb={4}>
              <Box
                w="16"
                h="16"
                bgGradient="linear(to-br, green.400, green.600)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="lg"
              >
                <Text fontSize="4xl">⚽</Text>
              </Box>
            </Flex>
            <Heading size="lg" color="white">
              {t("completeProfile") || "Complete Your Profile"}
            </Heading>
            <Text color="green.50" fontSize="sm" mt={2}>
              {t("tellUsAboutYou") || "Tell us more about your football journey"}
            </Text>
          </CardHeader>

          <CardBody p={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Date of Birth */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                    {t("dateOfBirth") || "Date of Birth"}
                  </FormLabel>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    bg={inputBg}
                  />
                </FormControl>

                {/* Team */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                    {t("team") || "Team"}
                  </FormLabel>
                  <Select
                    placeholder={t("selectTeam") || "Select your team"}
                    value={formData.team_id}
                    onChange={(e) => handleInputChange("team_id", e.target.value)}
                    bg={inputBg}
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} (Age {team.age_limit})
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* Position */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                    {t("position") || "Position"}
                  </FormLabel>
                  <Select
                    placeholder={t("selectPosition") || "Select your position"}
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    bg={inputBg}
                  >
                    <option value="GK">Goalkeeper (GK)</option>
                    <option value="CB">Center Back (CB)</option>
                    <option value="LB">Left Back (LB)</option>
                    <option value="RB">Right Back (RB)</option>
                    <option value="CDM">Defensive Midfielder (CDM)</option>
                    <option value="CM">Central Midfielder (CM)</option>
                    <option value="CAM">Attacking Midfielder (CAM)</option>
                    <option value="LW">Left Winger (LW)</option>
                    <option value="RW">Right Winger (RW)</option>
                    <option value="ST">Striker (ST)</option>
                  </Select>
                </FormControl>

                {/* Height & Weight */}
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                      {t("height") || "Height"} (cm)
                    </FormLabel>
                    <Input
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      bg={inputBg}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                      {t("weight") || "Weight"} (kg)
                    </FormLabel>
                    <Input
                      type="number"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      bg={inputBg}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </FormControl>
                </Grid>

                {/* Strong Foot */}
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                    {t("strongFoot") || "Strong Foot"}
                  </FormLabel>
                  <Select
                    placeholder={t("selectFoot") || "Select your strong foot"}
                    value={formData.strong_foot}
                    onChange={(e) => handleInputChange("strong_foot", e.target.value)}
                    bg={inputBg}
                  >
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                  </Select>
                </FormControl>

                {/* Profile Photo */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color={labelColor}>
                    {t("profilePhoto") || "Profile Photo"} ({t("optional") || "Optional"})
                  </FormLabel>
                  <Flex align="center" gap={4}>
                    {photoPreview && (
                      <Avatar size="lg" src={photoPreview} border="2px" borderColor="green.200" />
                    )}
                    <Box flex="1">
                      <Button
                        as="label"
                        htmlFor="photo"
                        w="full"
                        variant="outline"
                        cursor="pointer"
                        leftIcon={<Text>📤</Text>}
                      >
                        {formData.image_url ? t("changePhoto") || "Change Photo" : t("uploadPhoto") || "Upload Photo"}
                      </Button>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        display="none"
                        onChange={handlePhotoChange}
                      />
                    </Box>
                  </Flex>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="full"
                  mt={4}
                  isLoading={loading}
                  bgGradient="linear(to-r, green.400, green.600)"
                  _hover={{ bgGradient: "linear(to-r, green.500, green.700)" }}
                >
                  {t("completeProfile") || "Complete Profile"}
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default CompleteProfilePage;
