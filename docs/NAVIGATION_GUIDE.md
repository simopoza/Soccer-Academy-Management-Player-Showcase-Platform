# Navigation Menu Update Guide

To add the new management pages to your admin sidebar/menu, update the navigation items in your Layout or Sidebar component.

## Suggested Menu Structure

```jsx
const adminMenuItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: FiHome,
  },
  {
    label: 'Management',
    isSection: true,
    items: [
      {
        label: 'Users',
        path: '/admin/users-management',
        icon: FiUsers,
        description: 'Manage users and roles',
      },
      {
        label: 'Players',
        path: '/admin/players-management',
        icon: FiUser,
        description: 'Manage player profiles',
      },
      {
        label: 'Teams',
        path: '/admin/teams-management',
        icon: FiUsers,
        description: 'Manage teams and coaches',
      },
      {
        label: 'Matches',
        path: '/admin/matches-management',
        icon: FiCalendar,
        description: 'Schedule and track matches',
      },
      {
        label: 'Statistics',
        path: '/admin/stats-management',
        icon: FiBarChart2,
        description: 'Player performance stats',
      },
    ],
  },
  {
    label: 'Analytics',
    path: '/admin/analytics',
    icon: FiTrendingUp,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: FiSettings,
  },
];
```

## Icon Imports

Add these to your Layout/Sidebar component:

```jsx
import { 
  FiHome,
  FiUsers,
  FiUser,
  FiCalendar,
  FiBarChart2,
  FiTrendingUp,
  FiSettings,
} from 'react-icons/fi';
```

## AdminMenuPage Update (Optional)

If you want to display these as cards on the admin menu page:

```jsx
const managementCards = [
  {
    title: 'Users Management',
    description: 'Manage users, roles, and permissions',
    path: '/admin/users-management',
    icon: FiUsers,
    color: 'blue',
    stats: '8 active users',
  },
  {
    title: 'Players Management',
    description: 'Manage player profiles and ratings',
    path: '/admin/players-management',
    icon: FiUser,
    color: 'green',
    stats: '8 players',
  },
  {
    title: 'Teams Management',
    description: 'Manage teams and coaches',
    path: '/admin/teams-management',
    icon: FiUsers,
    color: 'purple',
    stats: '8 teams',
  },
  {
    title: 'Matches Management',
    description: 'Schedule and track matches',
    path: '/admin/matches-management',
    icon: FiCalendar,
    color: 'orange',
    stats: '5 matches',
  },
  {
    title: 'Statistics Management',
    description: 'Track player performance',
    path: '/admin/stats-management',
    icon: FiBarChart2,
    color: 'red',
    stats: '8 records',
  },
];
```

## Quick Access Cards Example

```jsx
<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
  {managementCards.map((card) => (
    <Card
      key={card.path}
      as={Link}
      to={card.path}
      cursor="pointer"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      transition="all 0.2s"
    >
      <CardBody>
        <VStack align="start" spacing={3}>
          <Icon as={card.icon} boxSize={8} color={`${card.color}.500`} />
          <Heading size="md">{card.title}</Heading>
          <Text color="gray.600">{card.description}</Text>
          <Badge colorScheme={card.color}>{card.stats}</Badge>
        </VStack>
      </CardBody>
    </Card>
  ))}
</SimpleGrid>
```

## Breadcrumb Support

For better navigation, consider adding breadcrumbs:

```jsx
const breadcrumbMap = {
  '/admin/users-management': ['Admin', 'Users Management'],
  '/admin/players-management': ['Admin', 'Players Management'],
  '/admin/teams-management': ['Admin', 'Teams Management'],
  '/admin/matches-management': ['Admin', 'Matches Management'],
  '/admin/stats-management': ['Admin', 'Statistics Management'],
};
```

## Active Route Highlighting

Use React Router's `useLocation` to highlight active menu items:

```jsx
import { useLocation } from 'react-router-dom';

const location = useLocation();
const isActive = location.pathname === item.path;
```

## Mobile Menu

For mobile responsiveness, ensure your drawer/hamburger menu includes these new items with the same structure.
