import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const HistoryAppointments = () => {
  // ✅ Initialize with today's date (formatted YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleOpenAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setOpen(true);
  };

  const fetchAppointments = async (selectedDate = date) => {
    if (!selectedDate) {
      setError("Please select a date first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8000/api/appointments/history?date=${selectedDate}`
      );
      const data = await res.json();

      if (data.success) {
        setAppointments(data.data);
        console.log(data.data);
      } else {
        setError(data.message || "Failed to fetch appointments");
      }
    } catch (err) {
      setError("Something went wrong while fetching.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch today's appointments automatically on mount
  useEffect(() => {
    fetchAppointments(today);
  }, []);

  const searchAppointment = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter MRN, name, or phone to search.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8000/api/appointments/search?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();

      if (data.success) {
        // normalize to array so UI can reuse the same table
        setAppointments(Array.isArray(data.data) ? data.data : [data.data]);
      } else {
        setError(data.message || "No appointment found.");
        setAppointments([]);
      }
    } catch (err) {
      setError("Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>History Appointments</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button onClick={() => fetchAppointments(date)} disabled={loading}>
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </CardContent>

        {/* 🔍 Search bar below date picker */}
        <CardContent className="flex gap-2 mt-2">
          <Input
            type="text"
            placeholder="Search by MRN, Name, or Phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={searchAppointment} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {appointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Appointments ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Doctor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:shadow-lg transition"
                    onClick={() => handleOpenAppointment(appt)}
                  >
                    <TableCell>{appt.name || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(appt.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{appt.timeIn || "N/A"}</TableCell>
                    <TableCell>{appt.doctor || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Overlay Pop-up */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Full details of the selected appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-2">
              <div>
                <Label>Name:</Label>
                <p>{selectedAppointment.name}</p>
              </div>
              <div>
                <Label>Date:</Label>
                <p>{selectedAppointment.date}</p>
              </div>
              <div>
                <Label>Time In:</Label>
                <p>{selectedAppointment.timeIn}</p>
              </div>
              <div>
                <Label>Time Out:</Label>
                <p>{selectedAppointment.timeOut}</p>
              </div>
              <div>
                <Label>Phone:</Label>
                <p>{selectedAppointment.phone}</p>
              </div>
              <div>
                <Label>Email:</Label>
                <p>{selectedAppointment.email}</p>
              </div>
              <div>
                <Label>Notes:</Label>
                <p>{selectedAppointment.notes || "No notes provided."}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {!loading && !error && date && appointments.length === 0 && (
        <Alert>
          <AlertTitle>No Appointments</AlertTitle>
          <AlertDescription>No appointments found for {date}.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
