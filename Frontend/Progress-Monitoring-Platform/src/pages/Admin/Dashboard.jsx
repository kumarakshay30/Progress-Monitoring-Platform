import React, { useEffect, useState, useCallback } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import StatsCard from '../../components/Dashboard/StatsCard';
import ChartContainer from '../../components/Dashboard/ChartContainer';
import RecentTasksTable from '../../components/Dashboard/RecentTasksTable';

// Chart colors
const COLORS = {
  // Status colors
  'In Progress': '#2196F3',
  'Completed': '#4CAF50',
  'Pending': '#FFC107',
  // Priority colors
  'High': '#F44336',
  'Medium': '#FFC107',
  'Low': '#4CAF50'
};

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Mock data - replace with API calls in a real application
const mockDashboardData = {
  stats: [
    { title: 'Total Tasks', value: '5', change: '+0%', trend: 'neutral' },
    { title: 'In Progress', value: '3', change: '0%', trend: 'neutral' },
    { title: 'Completed', value: '1', change: '0%', trend: 'neutral' },
    { title: 'Pending', value: '1', change: '0%', trend: 'neutral' },
  ],
  recentTasks: [
    { id: 1, title: 'Update UI Design', priority: 'High', status: 'In Progress', dueDate: '2023-12-15' },
    { id: 2, title: 'Fix Navigation Bug', priority: 'High', status: 'Pending', dueDate: '2023-12-14' },
    { id: 3, title: 'Write Documentation', priority: 'Medium', status: 'In Progress', dueDate: '2023-12-18' },
    { id: 4, title: 'Test New Features', priority: 'Low', status: 'Completed', dueDate: '2023-12-12' },
    { id: 5, title: 'Code Review', priority: 'Medium', status: 'In Progress', dueDate: '2023-12-16' },
  ],
  taskDistribution: [
    { name: 'Completed', value: 1, color: COLORS['Completed'] },
    { name: 'In Progress', value: 3, color: COLORS['In Progress'] },
    { name: 'Pending', value: 1, color: COLORS['Pending'] }
  ],
  priorityDistribution: [
    { name: 'High', value: 2, color: COLORS['High'] },
    { name: 'Medium', value: 2, color: COLORS['Medium'] },
    { name: 'Low', value: 1, color: COLORS['Low'] }
  ]
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulate API call with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDashboardData(mockDashboardData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real application, you would fetch data from your API
      // const response = await axiosInstance.get(API_PATHS.DASHBOARD.DATA);
      // setDashboardData(response.data);
      
      // For now, we'll use mock data with a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setDashboardData(mockDashboardData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // In a real app, you might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format today's date for the header
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use the prepared data from mock
  const taskDistributionData = dashboardData.taskDistribution;
  const priorityDistributionData = dashboardData.priorityDistribution;

  // Custom legend component
  const renderCustomizedLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">{formattedDate}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardData.stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Task Distribution */}
        <ChartContainer title="Task Distribution">
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                >
                  {taskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        {/* Tasks by Priority */}
        <ChartContainer title="Tasks by Priority">
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityDistributionData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {priorityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      {/* Recent Tasks */}
      <RecentTasksTable tasks={dashboardData.recentTasks} />
    </div>
  );
};

export default Dashboard;