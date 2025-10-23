import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/Context/RoleProvider";
import { useToast } from "@/Components/ui/use-toast";
const API_URL = import.meta.env.VITE_API_URL;

export const PendingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role } = useRole();
  const { toast } = useToast(); 
  // Fetch pending appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${API_URL}appointments/pending?role=${role}`);
        const data = await res.json();
        setAppointments(data.data || []);
        console.log(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch appointments.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleStart = (id) => {
    navigate(`/appointment/${id}`);
  };

  const formatToAMPM = (timeStr) => {
    let [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert 0 → 12 and 13–23 → 1–11
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Pending Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-muted-foreground">No pending appointments.</p>
      ) : (
        appointments.map((appt) => (
          <Card key={appt._id} className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>{appt.name} | {appt.fatherName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                MRN: {appt.mrn} | {appt.sex}, {appt.age} yrs
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Department:</strong> {appt.doctor}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(appt.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time In:</strong>{" "}
                  {appt.timeIn && appt.timeIn.trim() !== ""
                    ? formatToAMPM(appt.timeIn)
                    : "—"}
                </p>

                <p>
                  <strong>Phone:</strong> {appt.phone}
                </p>
              </div>

              <Separator className="my-3" />

              <Button
                onClick={() => handleStart(appt._id)}
                className="cursor-pointer"
              >
                Start
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
