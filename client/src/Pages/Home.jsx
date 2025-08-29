"use client";
import { useEffect, useState } from "react";
import { useRole } from "@/context/RoleProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL;

export const Home = () => {
  const { role } = useRole();
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Fetch pending appointments
        const pendingRes = await fetch(`${API_URL}appointments/pending?role=${role}`);
        const pendingData = await pendingRes.json();
        if (pendingData.success) {
          setPendingCount(pendingData.count);
        }

        // Fetch today's appointments
        const historyRes = await fetch(`${API_URL}appointments/history?date=${today}`);
        const historyData = await historyRes.json();

        if (historyData.success) {
          // Count completed ones
          const completed = historyData.data.filter(
            (appt) => appt.status === "Completed"
          );
          setCompletedCount(completed.length);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchData();
  }, [role]);

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      <div className="flex-1 flex flex-col items-center justify-start ml-4">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to Family Care Hospital
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Completed Appointments (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
