import React, { useState, useEffect, useRef } from "react";
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
import html2pdf from "html2pdf.js";
import { renderAsync } from "docx-preview";

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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [docxContent, setDocxContent] = useState(null);

  // Ref to trigger hidden input
  const fileInputRef = useRef(null);

  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

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

  const handleSaveTimes = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/appointments/${id}/time`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeIn, timeOut }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Times updated successfully!");
      } else {
        alert(data.message || "Failed to update times");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving times.");
    }
  };

  const handleChooseTemplate = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".docx")) {
      setSelectedTemplate(file);

      const arrayBuffer = await file.arrayBuffer();
      const container = document.createElement("div");
      container.style.fontFamily = "Arial, sans-serif";
      await renderAsync(arrayBuffer, container);

      setDocxContent(container.innerHTML);
    } else {
      alert("Please select a valid .docx file");
    }
  };

  const handleGeneratePrescription = async () => {
    if (!docxContent || !selectedAppointment) {
      alert("Please choose a template and make sure appointment is loaded.");
      return;
    }

    const element = document.createElement("div");
    element.style.paddingTop = "120px";
    element.style.paddingBottom = "120px";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.fontSize = "10pt";
    element.style.lineHeight = "1.2";
    element.style.maxHeight = "1000px";
    element.style.overflow = "hidden";

    element.innerHTML = `
      <style>
        * { background-color: transparent !important; }
        p { margin-top: 2px !important; margin-bottom: 2px !important; }
        div { margin-top: 0 !important; }
      </style>
      <div style="max-width:700px; margin:auto;">
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 8px; font-size:10pt;">
          <p><strong>Doctor:</strong> ${selectedAppointment.doctor}</p>
          <p><strong>Status:</strong> ${selectedAppointment.status}</p>
          <p><strong>Date:</strong> ${new Date(
            selectedAppointment.date
          ).toLocaleDateString()}</p>
          <p><strong>Time In:</strong> ${timeIn}</p>
          <p><strong>Time Out:</strong> ${timeOut}</p>
          <p><strong>Phone:</strong> ${selectedAppointment.phone}</p>
          <p><strong>CNIC:</strong> ${selectedAppointment.cnic}</p>
                    <p><strong>Address:</strong> ${
                      selectedAppointment.address
                    }</p>
          <p><strong>Gestation:</strong> ${selectedAppointment.gestation}</p>
          <p><strong>Height:</strong> ${selectedAppointment.height} cm</p>
          <p><strong>Weight:</strong> ${selectedAppointment.weight} kg</p>
          <p><strong>BP:</strong> ${selectedAppointment.bp}</p>
          <p><strong>Pulse:</strong> ${selectedAppointment.pulse}</p>
          <p><strong>Temperature:</strong> ${
            selectedAppointment.temperature
          } °C</p>
          <p><strong>VCO:</strong> ${selectedAppointment.vco ? "Yes" : "No"}</p>
        </div>
        <hr style="margin: 12px 0;" />
        <div style="font-size:10pt; line-height:1.2;">
          ${docxContent}
        </div>
      </div>
    `;

    // Generate PDF as Blob
    const worker = html2pdf()
      .from(element)
      .set({
        margin: [10, 15, 10, 15],
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .toPdf();

    worker.get("pdf").then(async (pdf) => {
      const pdfBlob = new Blob([pdf.output("arraybuffer")], {
        type: "application/pdf",
      });

      // Create form data
      const formData = new FormData();
      formData.append("mrn", selectedAppointment.mrn); // backend uses this for filename
      formData.append("file", pdfBlob, `${selectedAppointment.mrn}.pdf`);

      // ⬇️ Send template name too
      if (selectedTemplate) {
        formData.append("templateName", selectedTemplate.name);
      }
      try {
        const res = await fetch(
          "http://localhost:8000/api/appointments/prescription",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.success) {
          alert("Prescription saved on server successfully!");
          // Optional: also open in new tab for print
          const url = URL.createObjectURL(pdfBlob);
          window.open(url, "_blank");
        } else {
          alert(data.message || "Failed to save prescription.");
        }
      } catch (err) {
        console.error("Error uploading prescription:", err);
        alert("Error uploading prescription.");
      }
    });
  };

  const handleViewPrescription = async (mrn) => {
  try {
    if (!mrn) {
      alert("MRN is missing");
      return;
    }

    // Open in new tab directly
    window.open(`http://localhost:8000/api/appointments/openPrescription/${mrn}`, "_blank");
  } catch (error) {
    console.error("Error opening prescription:", error);
    alert("Failed to open prescription");
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
                  <TableHead>MRN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>TimeIn</TableHead>
                  <TableHead>TimeOut</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt, idx) => (
                  <TableRow
                    key={idx}
                    className="cursor-pointer hover:shadow-lg transition"
                    onClick={() => {
                      handleOpenAppointment(appt);
                      setTimeIn(appt.timeIn);
                      setTimeOut(appt.timeOut);
                    }}
                  >
                    <TableCell>{appt.mrn || "N/A"}</TableCell>
                    <TableCell>{appt.name || "N/A"}</TableCell>
                    <TableCell>{appt.doctor || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(appt.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{appt.timeIn || "N/A"}</TableCell>
                    <TableCell>{appt.timeOut || "N/A"}</TableCell>
                    <TableCell>{appt.status || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Full details of the selected appointment
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="grid grid-cols-2 gap-4 text-sm flex-1 overflow-y-auto pr-2">
              <div>
                <Label>MRN:</Label>
                <p>{selectedAppointment.mrn}</p>
              </div>
              <div>
                <Label>Name:</Label>
                <p>{selectedAppointment.name}</p>
              </div>
              <div>
                <Label>Sex:</Label>
                <p>{selectedAppointment.sex}</p>
              </div>
              <div>
                <Label>Age:</Label>
                <p>{selectedAppointment.age}</p>
              </div>
              <div>
                <Label>Date:</Label>
                <p>{new Date(selectedAppointment.date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Status:</Label>
                <p>{selectedAppointment.status}</p>
              </div>
              <div>
                <Label>Department:</Label>
                <p>{selectedAppointment.doctor}</p>
              </div>
              <div>
                <Label>CNIC:</Label>
                <p>{selectedAppointment.cnic}</p>
              </div>
              <div>
                <Label>Phone:</Label>
                <p>{selectedAppointment.phone}</p>
              </div>
              <div>
                <Label>Address:</Label>
                <p>{selectedAppointment.address}</p>
              </div>
              <div>
                <Label>Gestation:</Label>
                <p>{selectedAppointment.gestation || "N/A"}</p>
              </div>
              <div>
                <Label>Height:</Label>
                <p>
                  {selectedAppointment.height
                    ? `${selectedAppointment.height} cm`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label>Weight:</Label>
                <p>
                  {selectedAppointment.weight
                    ? `${selectedAppointment.weight} kg`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label>BP:</Label>
                <p>{selectedAppointment.bp || "N/A"}</p>
              </div>
              <div>
                <Label>Pulse:</Label>
                <p>
                  {selectedAppointment.pulse
                    ? `${selectedAppointment.pulse} bpm`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label>Temperature:</Label>
                <p>
                  {selectedAppointment.temperature
                    ? `${selectedAppointment.temperature} °C`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label>VCO:</Label>
                <p>{selectedAppointment.vco ? "Yes" : "No"}</p>
              </div>
              <div>
                <Label>Template Used:</Label>
                <p>{selectedAppointment.template || "N/A"}</p>
              </div>
              <div>
                <Label>Time In:</Label>
                <p>{selectedAppointment.timeIn || "N/A"}</p>
              </div>
              <div>
                <Label>Time Out:</Label>
                <p>{selectedAppointment.timeOut || "N/A"}</p>
              </div>
            </div>
          )}

          {/* Editable Times Section */}
          {selectedAppointment && (
            <div className="mt-4 ">
              <h4 className="font-semibold text-sm mb-2">Update Times</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Time In
                  </label>
                  <input
                    type="time"
                    value={timeIn}
                    onChange={(e) => setTimeIn(e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Time Out
                  </label>
                  <input
                    type="time"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between gap-2 mt-3">
                <Button
                  onClick={() => handleSaveTimes(selectedAppointment._id)}
                >
                  Save Times
                </Button>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".doc,.docx"
                    className="hidden"
                  />
                  <Button variant="outline" onClick={handleChooseTemplate}>
                    Choose Template
                  </Button>
                  <Button onClick={handleGeneratePrescription}>
                    Save Prescription
                  </Button>
                  {selectedTemplate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {selectedTemplate.name}
                    </p>
                  )}
                </div>
              </div>
              {/* ✅ New button to view prescription */}
              <div className="pt-3 justify-center align-middle flex">
                <Button
                  onClick={() =>
                    handleViewPrescription(selectedAppointment.mrn)
                  }
                >
                  View Prescription
                </Button>
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
