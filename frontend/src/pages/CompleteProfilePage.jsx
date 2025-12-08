import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CompleteProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if profile already completed - redirect to dashboard
  useEffect(() => {
    if (user?.profile_completed) {
      console.log("Profile already completed, redirecting to dashboard...");
      navigate("/player/dashboard");
    }
  }, [user, navigate]);

  // If profile already completed, show nothing while redirecting
  if (user?.profile_completed) {
    return null;
  }

  return (
    <div>
      <h1>Complete Your Profile</h1>
      {/* TODO: Add your profile completion form here */}
      {/* 
        When submitting the form, use:
        PUT /api/v1/players/${user.id}/complete-profile
        
        After successful completion, update user in AuthContext:
        updateUser({ profile_completed: true });
        navigate("/player/dashboard");
      */}
    </div>
  );
};

export default CompleteProfilePage;
