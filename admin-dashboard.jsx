import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Menu, 
  X,
  BarChart3,
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statsData = [
  { name: 'Jan', rating: 65 },
  { name: 'Feb', rating: 72 },
  { name: 'Mar', rating: 68 },
  { name: 'Apr', rating: 78 },
  { name: 'May', rating: 82 },
  { name: 'Jun', rating: 85 },
];

const recentMatches = [
  { id: 1, team1: 'Eagles U16', team2: 'Lions U16', score: '3-2', date: '2025-12-01', status: 'Won' },
  { id: 2, team1: 'Hawks U18', team2: 'Tigers U18', score: '1-1', date: '2025-11-28', status: 'Draw' },
  { id: 3, team1: 'Falcons U14', team2: 'Sharks U14', score: '0-2', date: '2025-11-25', status: 'Lost' },
  { id: 4, team1: 'Eagles U12', team2: 'Bears U12', score: '4-1', date: '2025-11-22', status: 'Won' },
  { id: 5, team1: 'Hawks U16', team2: 'Wolves U16', score: '2-3', date: '2025-11-20', status: 'Lost' },
];

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-emerald-100 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-emerald-100">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M2 12h20" />
                <path d="M8 8l8 8M16 8l-8 8" />
              </svg>
            </div>
            <div>
              <h2 className="text-emerald-700">Football Academy</h2>
              <p className="text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button variant="default" className="w-full justify-start bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
              <Users className="mr-2 h-4 w-4" />
              Players
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
              <Trophy className="mr-2 h-4 w-4" />
              Teams
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
              <Calendar className="mr-2 h-4 w-4" />
              Matches
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50 hover:text-emerald-700">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-emerald-100">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-red-50 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-emerald-100 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div>
                <h1 className="text-emerald-700">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Total Players</CardTitle>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-emerald-700">248</div>
                <p className="text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Active Teams</CardTitle>
                <Trophy className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-emerald-700">12</div>
                <p className="text-muted-foreground">Across all age groups</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Matches Played</CardTitle>
                <Calendar className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-emerald-700">156</div>
                <p className="text-muted-foreground">This season</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Ratings Overview Chart */}
            <Card className="shadow-lg border-emerald-100">
              <CardHeader>
                <CardTitle>Performance Ratings</CardTitle>
                <CardDescription>Average team ratings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={statsData}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRating)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Matches Table */}
            <Card className="shadow-lg border-emerald-100">
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
                <CardDescription>Latest match results</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teams</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMatches.map((match) => (
                      <TableRow key={match.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{match.team1}</div>
                            <div className="text-muted-foreground">{match.team2}</div>
                          </div>
                        </TableCell>
                        <TableCell>{match.score}</TableCell>
                        <TableCell>{match.date}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              match.status === 'Won' ? 'default' : 
                              match.status === 'Draw' ? 'secondary' : 
                              'destructive'
                            }
                            className={
                              match.status === 'Won' 
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                                : ''
                            }
                          >
                            {match.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
