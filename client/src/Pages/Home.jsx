"use client";
import { useEffect, useState } from "react";
import { useRole } from "@/Context/RoleProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const API_URL = import.meta.env.VITE_API_URL;

export const Home = () => {
  const { role } = useRole();
  const [stats, setStats] = useState(null);
  const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}appointments/dashboardStats?role=${role}`);
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchStats();
  }, [role]);

  if (!stats) return <p className="p-4 text-center">Loading dashboard...</p>;

  return (
    <div className="container mx-auto p-6 flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        🏥 Family Care Hospital — Clinical Laboratory
      </h1>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Pending Appointments" value={stats.pendingCount} color="bg-yellow-100" />
        <StatCard title="Completed Appointments" value={stats.completedCount} color="bg-green-100" />
        <StatCard title="Total Prescriptions" value={stats.totalPrescriptions} color="bg-blue-100" />
        <StatCard title="Lab Reports" value={stats.totalLabs} color="bg-purple-100" />
      </div>

      {/* Daily Appointments Trend */}
      <Card className="shadow-md rounded-2xl p-4">
        <CardHeader><CardTitle>📅 Appointments in Last 7 Days</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#4CAF50" name="Completed" />
              <Line type="monotone" dataKey="pending" stroke="#FF9800" name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Doctor-wise Appointments */}
      <Card className="shadow-md rounded-2xl p-4">
        <CardHeader><CardTitle>👨‍⚕️ Appointments by Doctor</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.doctorStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      <Card className="shadow-md rounded-2xl p-4">
        <CardHeader><CardTitle>🧍 Patient Gender Ratio</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.genderStats}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats.genderStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, color }) => (
  <Card className={`shadow-lg rounded-2xl p-4 ${color}`}>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent>
      <p className="text-4xl font-bold text-center mt-2">{value}</p>
    </CardContent>
  </Card>
);
