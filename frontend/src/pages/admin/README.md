# Admin Management Pages

This directory contains the admin management pages for the Soccer Academy Management Platform. These pages follow a consistent design pattern with reusable components.

## Pages Overview

### 1. Users Management (`AdminUsersPage.jsx`)
**Route:** `/admin/users-management`

Manage academy users and their roles.

**Features:**
- View all users with name, email, role, and status
- Filter by role (Admin, Coach, Player, Agent)
- Search by name or email
- Add/Edit/Delete user records
- Modal dialogs for all CRUD operations

### 2. Players Management (`AdminPlayersPage.jsx`)
**Route:** `/admin/players-management`

Manage player information and team assignments.

**Features:**
- View player details: name, jersey number, team, position, rating, status
- Filter by team
- Search by player name
- Color-coded rating badges (8.5+ green, 7.5+ blue, else yellow)
- Status tracking (Active/Injured)
- Add/Edit/Delete player records

### 3. Teams Management (`AdminTeamsPage.jsx`)
**Route:** `/admin/teams-management`

Manage academy teams across different age categories.

**Features:**
- View team details: name, age category, coach, player count, founded year
- Filter by age category (U12, U14, U16, U18)
- Search by team name or coach
- Status tracking (Active/Inactive)
- Add/Edit/Delete team records with description field

### 4. Matches Management (`AdminMatchesPage.jsx`)
**Route:** `/admin/matches-management`

Schedule and manage matches and fixtures.

**Features:**
- Statistics cards showing Total/Upcoming/Completed matches
- View match details: teams, date/time, location, type (Home/Away), score
- Filter by status (Upcoming/Completed) and match type
- Search by team or opponent name
- Competition types (League, Cup, Friendly)
- Score display with result badges (Won/Draw/Lost)
- Add/Edit/Delete match records

### 5. Statistics Management (`AdminStatsPage.jsx`)
**Route:** `/admin/stats-management`

Record and manage player performance statistics.

**Features:**
- View player stats: goals, assists, minutes, saves, cards, rating
- Advanced filtering (by player or by match)
- Dynamic filter options based on filter type
- Performance metrics display
- Color-coded rating badges (9.0+ green, 8.0+ blue, 7.0+ yellow, else red)
- Card tracking (Yellow/Red) with visual badges
- Add/Edit/Delete statistics records

## Reusable Components

### UI Components (`src/components/ui/`)

- **Badge** - Status/role indicators with color variants (success, warning, danger, info, default)
- **AvatarCircle** - User avatars with automatic initials generation
- **ActionButtons** - Edit/Delete action buttons with tooltips
- **SearchInput** - Search field with icon
- **FilterSelect** - Dropdown filter component

### Table Components (`src/components/table/`)

- **DataTable** - Configurable data table with custom cell renderers
- **TableHeader** - Page header with title, count, and action button

## Design Tokens

Located in `src/theme.js`:

### Colors
- Primary Green: `#16A34A` (green.500)
- Primary Soft: `#DCFCE7` (green.50)
- Text Primary: `#0F172A` (gray.900)
- Text Secondary: `#64748B` (gray.500)
- Background: `#F8FAFC` (gray.50)
- Border: `#E2E8F0` (gray.200)

### Spacing Scale (8px base)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Typography
- Font: Inter
- Page Title: 24px, weight 600
- Section Title: 18px, weight 600
- Table Header: 14px, weight 500
- Table Text: 14px
- Badge: 12px

### Component Sizes
- Card Border Radius: 12px
- Input/Button Height: 40px
- Input/Button Radius: 8px
- Table Row Height: ~56px

## Common Patterns

### Modal Structure
All pages follow the same modal pattern:
1. **Add Modal** - Create new records
2. **Edit Modal** - Update existing records  
3. **Delete Modal** - Confirm deletion

### State Management
Each page manages:
- Data array (local state for demo, will connect to API)
- Search query
- Filter values
- Selected item
- Form data
- Modal visibility (using Chakra UI `useDisclosure`)

### Toast Notifications
Success messages for:
- Item added
- Item updated
- Item deleted

## Usage Examples

### DataTable Configuration
```jsx
const columns = [
  {
    header: 'Name',
    accessor: 'name',
    render: (row) => <Text fontWeight="600">{row.name}</Text>
  },
  {
    header: 'Status',
    accessor: 'status',
    render: (row) => <Badge variant="success">{row.status}</Badge>
  },
];

<DataTable columns={columns} data={filteredData} />
```

### Badge Variants
```jsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Injured</Badge>
<Badge variant="danger">Suspended</Badge>
<Badge variant="info">Coach</Badge>
<Badge variant="default">Inactive</Badge>
```

## Next Steps

1. **API Integration**: Replace local state with API calls using axios/react-query
2. **Pagination**: Add pagination for large datasets
3. **Sorting**: Add column sorting functionality
4. **Export**: Add CSV/PDF export capabilities
5. **Advanced Filters**: Date ranges, multi-select filters
6. **Bulk Actions**: Select multiple items for batch operations
7. **Permissions**: Role-based UI visibility
8. **Real-time Updates**: WebSocket for live data updates

## File Structure
```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Badge.jsx
│   │   ├── AvatarCircle.jsx
│   │   ├── ActionButtons.jsx
│   │   ├── SearchInput.jsx
│   │   └── FilterSelect.jsx
│   └── table/
│       ├── DataTable.jsx
│       └── TableHeader.jsx
├── pages/admin/
│   ├── AdminUsersPage.jsx
│   ├── AdminPlayersPage.jsx
│   ├── AdminTeamsPage.jsx
│   ├── AdminMatchesPage.jsx
│   └── AdminStatsPage.jsx
├── routes/
│   └── AppRoutes.jsx (updated with new routes)
└── theme.js (design tokens)
```

## Notes

- All pages use the existing `Layout` component
- Follows Chakra UI design system
- Responsive design (mobile-friendly)
- Accessibility considerations (ARIA labels, keyboard navigation)
- Consistent spacing and visual hierarchy
- Professional admin dashboard aesthetic
