# Tomorrow's Implementation Plan - December 10, 2025

## 🎯 Goals for Tomorrow

1. **Integrate Real Email Service** - Replace console.log with actual email delivery
2. **Build Profile Completion Form** - Player profile UI with validation

---

## 📧 Task 1: Email Service Integration (2-3 hours)

### Option A: SendGrid (Recommended)
**Why:** Free tier (100 emails/day), easy setup, reliable

**Steps:**
1. Create SendGrid account (https://signup.sendgrid.com/)
2. Verify sender email
3. Get API key
4. Install package: `npm install @sendgrid/mail`
5. Update `backend/helpers/emailService.js`
6. Test email delivery

**Code Changes:**
```javascript
// backend/helpers/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendApprovalEmail = async (email, firstName) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL, // verified sender
    subject: 'Your Account Has Been Approved! ✅',
    text: `Hi ${firstName}, Great news! Your account has been approved...`,
    html: `<strong>Hi ${firstName}</strong><p>Great news! Your account has been approved...</p>`,
  };
  
  await sgMail.send(msg);
  console.log('✅ Approval email sent to:', email);
};
```

**Environment Variables:**
```env
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=your_verified_email@example.com
FRONTEND_URL=http://localhost:5173
```

---

### Option B: Nodemailer with Gmail (Free, Simple)
**Why:** No signup needed if you have Gmail, perfect for development

**Steps:**
1. Enable 2FA on Gmail
2. Create App Password (Google Account → Security → App Passwords)
3. Install package: `npm install nodemailer`
4. Update emailService.js
5. Test

**Code Changes:**
```javascript
// backend/helpers/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // App password, not regular password
  },
});

const sendApprovalEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Account Has Been Approved! ✅',
    html: `<h2>Hi ${firstName}!</h2><p>Great news! Your account has been approved...</p>`,
  };
  
  await transporter.sendMail(mailOptions);
  console.log('✅ Approval email sent to:', email);
};
```

**Environment Variables:**
```env
EMAIL_USER=your.email@gmail.com
EMAIL_APP_PASSWORD=your_app_password_here
FRONTEND_URL=http://localhost:5173
```

---

### Testing Email Service:

**Create test script:**
```javascript
// backend/scripts/testEmail.js
const { sendApprovalEmail } = require('../helpers/emailService');

const testEmail = async () => {
  try {
    await sendApprovalEmail('your.email@gmail.com', 'Test User');
    console.log('✅ Test email sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    process.exit(1);
  }
};

testEmail();
```

**Run:**
```bash
npm run test-email
```

---

## 👤 Task 2: Profile Completion Form (3-4 hours)

### Database: Already Ready ✅
The Players table already has all fields we need:
- first_name, last_name (from Users table)
- date_of_birth
- height (DECIMAL)
- weight (DECIMAL)
- strong_foot (ENUM: 'Left', 'Right')
- position (ENUM: 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST')
- image_url (optional)
- team_id (optional, assigned by admin later)

### Backend Changes Needed:

**1. Create `completeProfile` endpoint:**

File: `backend/controllers/playersController.js`

```javascript
// Complete player profile (player only, first time)
const completeProfile = async (req, res) => {
  const userId = req.user.id; // From auth middleware
  const {
    first_name,
    last_name,
    date_of_birth,
    height,
    weight,
    strong_foot,
    position,
    image_url
  } = req.body;

  try {
    // 1. Update Users table (first_name, last_name)
    await db.query(
      "UPDATE Users SET first_name = ?, last_name = ?, profile_completed = TRUE WHERE id = ?",
      [first_name, last_name, userId]
    );

    // 2. Update Players table
    await db.query(
      `UPDATE Players 
       SET first_name = ?, last_name = ?, date_of_birth = ?, 
           height = ?, weight = ?, strong_foot = ?, position = ?, image_url = ?
       WHERE user_id = ?`,
      [first_name, last_name, date_of_birth, height, weight, strong_foot, position, image_url, userId]
    );

    // 3. Return success
    res.status(200).json({
      message: "Profile completed successfully!",
      user: { first_name, last_name, profile_completed: true }
    });
  } catch (error) {
    console.error("Error completing profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // ... existing exports
  completeProfile
};
```

**2. Add route:**

File: `backend/routes/players.js`

```javascript
// Complete profile (player only)
router.post('/complete-profile', hasRole('player'), completeProfile);
```

**3. Create validator:**

File: `backend/validators/profileValidator.js`

```javascript
const { body } = require('express-validator');

const completeProfileValidation = [
  body('first_name')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('First name too short'),
  
  body('last_name')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2 }).withMessage('Last name too short'),
  
  body('date_of_birth')
    .notEmpty().withMessage('Date of birth is required')
    .isDate().withMessage('Invalid date format'),
  
  body('height')
    .notEmpty().withMessage('Height is required')
    .isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100-250 cm'),
  
  body('weight')
    .notEmpty().withMessage('Weight is required')
    .isFloat({ min: 30, max: 150 }).withMessage('Weight must be between 30-150 kg'),
  
  body('strong_foot')
    .notEmpty().withMessage('Strong foot is required')
    .isIn(['Left', 'Right']).withMessage('Strong foot must be Left or Right'),
  
  body('position')
    .notEmpty().withMessage('Position is required')
    .isIn(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])
    .withMessage('Invalid position'),
  
  body('image_url')
    .optional()
    .isURL().withMessage('Invalid URL format'),
];

module.exports = { completeProfileValidation };
```

---

### Frontend Changes:

**1. Create service method:**

File: `frontend/src/services/playerService.js`

```javascript
import axiosInstance from "./axiosInstance";

const completeProfile = async (profileData) => {
  const response = await axiosInstance.post("/players/complete-profile", profileData);
  return response.data;
};

export default {
  completeProfile,
  // ... other player methods
};
```

**2. Update CompleteProfilePage.jsx:**

```javascript
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  useToast,
  Card,
  CardHeader,
  CardBody,
  FormErrorMessage,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import playerService from "../services/playerService";

// Validation schema
const profileSchema = yup.object().shape({
  first_name: yup.string().required("First name is required").min(2, "Too short"),
  last_name: yup.string().required("Last name is required").min(2, "Too short"),
  date_of_birth: yup.date().required("Date of birth is required").max(new Date(), "Invalid date"),
  height: yup.number().required("Height is required").min(100, "Too short").max(250, "Too tall"),
  weight: yup.number().required("Weight is required").min(30, "Too light").max(150, "Too heavy"),
  strong_foot: yup.string().required("Strong foot is required").oneOf(['Left', 'Right']),
  position: yup.string().required("Position is required"),
  image_url: yup.string().url("Invalid URL").optional(),
});

const CompleteProfilePage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    }
  });

  const onSubmit = async (data) => {
    try {
      await playerService.completeProfile(data);
      
      // Update user in context
      updateUser({ ...user, profile_completed: true });
      
      toast({
        title: "Profile Completed!",
        description: "Your profile has been saved successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      navigate("/player/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const positions = [
    { value: 'GK', label: 'Goalkeeper' },
    { value: 'CB', label: 'Center Back' },
    { value: 'LB', label: 'Left Back' },
    { value: 'RB', label: 'Right Back' },
    { value: 'CDM', label: 'Defensive Midfielder' },
    { value: 'CM', label: 'Central Midfielder' },
    { value: 'CAM', label: 'Attacking Midfielder' },
    { value: 'LW', label: 'Left Wing' },
    { value: 'RW', label: 'Right Wing' },
    { value: 'ST', label: 'Striker' },
  ];

  return (
    <Box minH="100vh" bgGradient="linear(to-b, green.50, white)" py={8}>
      <Container maxW="container.md">
        <Card boxShadow="lg">
          <CardHeader bg="green.500" py={6}>
            <Heading size="lg" color="white">⚽ Complete Your Profile</Heading>
            <Text color="green.50" fontSize="sm" mt={2}>
              Please fill in your information to continue
            </Text>
          </CardHeader>
          
          <CardBody p={8}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={6}>
                {/* Name Fields */}
                <HStack spacing={4} w="full">
                  <FormControl isInvalid={errors.first_name}>
                    <FormLabel>First Name</FormLabel>
                    <Input {...register("first_name")} />
                    <FormErrorMessage>{errors.first_name?.message}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.last_name}>
                    <FormLabel>Last Name</FormLabel>
                    <Input {...register("last_name")} />
                    <FormErrorMessage>{errors.last_name?.message}</FormErrorMessage>
                  </FormControl>
                </HStack>

                {/* Date of Birth */}
                <FormControl isInvalid={errors.date_of_birth}>
                  <FormLabel>Date of Birth</FormLabel>
                  <Input type="date" {...register("date_of_birth")} />
                  <FormErrorMessage>{errors.date_of_birth?.message}</FormErrorMessage>
                </FormControl>

                {/* Height & Weight */}
                <HStack spacing={4} w="full">
                  <FormControl isInvalid={errors.height}>
                    <FormLabel>Height (cm)</FormLabel>
                    <Input type="number" step="0.1" {...register("height")} />
                    <FormErrorMessage>{errors.height?.message}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.weight}>
                    <FormLabel>Weight (kg)</FormLabel>
                    <Input type="number" step="0.1" {...register("weight")} />
                    <FormErrorMessage>{errors.weight?.message}</FormErrorMessage>
                  </FormControl>
                </HStack>

                {/* Strong Foot & Position */}
                <HStack spacing={4} w="full">
                  <FormControl isInvalid={errors.strong_foot}>
                    <FormLabel>Strong Foot</FormLabel>
                    <Select {...register("strong_foot")} placeholder="Select...">
                      <option value="Left">Left</option>
                      <option value="Right">Right</option>
                    </Select>
                    <FormErrorMessage>{errors.strong_foot?.message}</FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={errors.position}>
                    <FormLabel>Position</FormLabel>
                    <Select {...register("position")} placeholder="Select...">
                      {positions.map(pos => (
                        <option key={pos.value} value={pos.value}>{pos.label}</option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.position?.message}</FormErrorMessage>
                  </FormControl>
                </HStack>

                {/* Image URL (Optional) */}
                <FormControl isInvalid={errors.image_url}>
                  <FormLabel>Profile Image URL (Optional)</FormLabel>
                  <Input type="url" {...register("image_url")} placeholder="https://..." />
                  <FormErrorMessage>{errors.image_url?.message}</FormErrorMessage>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  w="full"
                  isLoading={isSubmitting}
                >
                  Complete Profile
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
```

---

## 📋 Tomorrow's Checklist

### Morning: Email Integration (2-3 hours)
- [ ] Choose email service (SendGrid or Gmail)
- [ ] Create account and get credentials
- [ ] Install npm package
- [ ] Update `.env` file
- [ ] Update `emailService.js`
- [ ] Create test script
- [ ] Test approval email
- [ ] Test rejection email
- [ ] Verify emails arrive correctly

### Afternoon: Profile Completion (3-4 hours)
- [ ] Create `completeProfile` endpoint in playersController
- [ ] Add validation with express-validator
- [ ] Add route with role protection
- [ ] Create playerService.js in frontend
- [ ] Build CompleteProfilePage.jsx UI
- [ ] Add form validation with yup
- [ ] Test profile completion flow
- [ ] Verify database updates correctly
- [ ] Test redirect after completion

### Testing (1 hour)
- [ ] Test complete flow: Register → Approve → Login → Complete Profile
- [ ] Test email delivery (real emails!)
- [ ] Test validation errors
- [ ] Test bilingual support on profile form
- [ ] Verify profile_completed flag updates

### Commit & Push
- [ ] Commit email integration
- [ ] Commit profile completion
- [ ] Update documentation
- [ ] Push to GitHub

---

## 🎯 Success Criteria

By end of tomorrow:
✅ Real emails sent on approval/rejection
✅ Beautiful profile completion form
✅ Full validation on frontend and backend
✅ Complete player onboarding flow working
✅ All changes committed and documented

---

## 💡 Tips for Tomorrow

1. **Email Service:**
   - Start with Gmail (faster setup for testing)
   - Can switch to SendGrid later for production
   - Test with your own email first

2. **Profile Form:**
   - Use Chakra UI components for consistency
   - Reuse your existing validation patterns
   - Keep the soccer theme (green colors)

3. **Testing:**
   - Test the entire flow end-to-end
   - Make sure emails actually arrive
   - Verify profile data saves correctly

---

## 📚 Resources

**Email:**
- SendGrid Docs: https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs
- Nodemailer Docs: https://nodemailer.com/about/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833

**React Hook Form:**
- Docs: https://react-hook-form.com/get-started
- Yup Integration: https://react-hook-form.com/get-started#SchemaValidation

**Chakra UI:**
- Form Components: https://chakra-ui.com/docs/components/form-control
- Date Input: https://chakra-ui.com/docs/components/input

---

**Good luck tomorrow! You've got this! 🚀⚽**
