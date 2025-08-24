import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export const HistoryAppointments = () => {
  const [date, setDate] = useState("")
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchAppointments = async () => {
    if (!date) {
      setError("Please select a date first.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/history?date=${date}`)
      const data = await res.json()

      if (data.success) {
        setAppointments(data.data)
      } else {
        setError(data.message || "Failed to fetch appointments")
      }
    } catch (err) {
      setError("Something went wrong while fetching.")
    } finally {
      setLoading(false)
    }
  }

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
          <Button onClick={fetchAppointments} disabled={loading}>
            {loading ? "Loading..." : "Fetch"}
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
                  <TableRow key={idx}>
                    <TableCell>{appt.patientName || "N/A"}</TableCell>
                    <TableCell>{new Date(appt.date).toLocaleDateString()}</TableCell>
                    <TableCell>{appt.timeIn || "N/A"}</TableCell>
                    <TableCell>{appt.doctorName || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && !error && date && appointments.length === 0 && (
        <Alert>
          <AlertTitle>No Appointments</AlertTitle>
          <AlertDescription>
            No appointments found for {date}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
