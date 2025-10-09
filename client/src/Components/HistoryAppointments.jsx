import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/Components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/Components/ui/dialog";
import { Label } from "@/Components/ui/label";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { renderAsync } from "docx-preview";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

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
  const navigate = useNavigate();

  // Ref to trigger hidden input
  const fileInputRef = useRef(null);

  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");

  const formatToAMPM = (timeStr) => {
    let [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert 0 → 12 and 13–23 → 1–11
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

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
        `${API_URL}appointments/history?date=${selectedDate}`
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
        `${API_URL}appointments/search?query=${encodeURIComponent(searchQuery)}`
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
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}appointments/${id}/time`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeIn, timeOut }),
      });

      const data = await res.json();
      if (data.success) {
        setLoading(false);
        alert("Times updated successfully!");
      } else {
        alert(data.message || "Failed to update times");
      }
    } catch (err) {
      setLoading(false);
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
    setLoading(true);
    if (!docxContent || !selectedAppointment) {
      alert("Please choose a template and make sure appointment is loaded.");
      return;
    }

    // Create hidden container for PDF rendering
    const hiddenDiv = document.createElement("div");
    hiddenDiv.style.paddingTop = "80px";
    hiddenDiv.style.paddingBottom = "120px";
    hiddenDiv.style.fontFamily = "Arial, sans-serif";
    hiddenDiv.style.fontSize = "10pt";
    hiddenDiv.style.lineHeight = "1.2";
    hiddenDiv.style.maxHeight = "1000px";
    hiddenDiv.style.overflow = "hidden";
    hiddenDiv.style.position = "absolute";
    hiddenDiv.style.top = "0";
    hiddenDiv.style.left = "-9999px";
    hiddenDiv.style.visibility = "visible"; // keep it renderable

    hiddenDiv.innerHTML = `
    <style>
      * { background-color: transparent !important; }
      p { margin-top: 2px !important; margin-bottom: 2px !important; }
      div { margin-top: 0 !important; }
    </style>
    <div style="max-width:700px; margin:auto;">
      <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 6px; font-size:8pt;">
      <p><strong>MRN:</strong> ${selectedAppointment.mrn}</p>
        <p><strong>Name:</strong> ${selectedAppointment.name}</p>
        <p><strong>Age:</strong> ${selectedAppointment.age}</p>
        <p><strong>Sex:</strong> ${selectedAppointment.sex}</p>
        <p><strong>Phone:</strong> ${selectedAppointment.phone}</p>
        <p><strong>CNIC:</strong> ${selectedAppointment.cnic}</p>
        <p><strong>Date:</strong> ${new Date(
          selectedAppointment.date
        ).toLocaleDateString()}</p>
        <p><strong>Height:</strong> ${selectedAppointment.height}</p>
        <p><strong>Weight:</strong> ${selectedAppointment.weight}</p>
        <p><strong>BP:</strong> ${selectedAppointment.bp}</p>
        <p><strong>Pulse:</strong> ${selectedAppointment.pulse}</p>
        <p><strong>Temperature:</strong> ${selectedAppointment.temperature}</p>
        <p><strong>VCO:</strong> ${selectedAppointment.vco ? "Yes" : "No"}</p>
        <p><strong>Address:</strong> ${selectedAppointment.address}</p>

      </div>

      <hr style="margin: 12px 0;" />
      
      <div style="font-size:9pt; text-align:right;">
        <p><strong>Time In:</strong> ${formatToAMPM(timeIn)}</p>
        <p><strong>Time Out:</strong> ${formatToAMPM(timeOut)}</p>
      </div>

    <!-- ✅ Content area with stamp above it -->
    <div style="font-size:10pt; line-height:1.2; margin-top:20px; position:relative;">
      <!-- Stamp positioned absolutely -->
      ${docxContent}
            <img src="/stamp.png" alt="Stamp"
           style="position:absolute; bottom:400px; right:20px; width:120px; z-index:10;" />
    </div>
    </div>
  `;

    document.body.appendChild(hiddenDiv);

    try {
      // Allow rendering
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Convert to canvas
      const canvas = await html2canvas(hiddenDiv, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg");

      // Generate A4 PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20; // leave margin like html2pdf
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // top margin

      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save blob
      const pdfBlob = new Blob([pdf.output("arraybuffer")], {
        type: "application/pdf",
      });

      // Upload to server
      const formData = new FormData();
      formData.append("mrn", selectedAppointment.mrn);
      formData.append("file", pdfBlob, `${selectedAppointment.mrn}.pdf`);

      if (selectedTemplate) {
        formData.append("templateName", selectedTemplate.name);
      }

      const res = await fetch(`${API_URL}appointments/prescription`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setLoading(false);
        alert("Prescription saved on server successfully!");
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, "_blank");
      } else {
        setLoading(false);
        alert(data.message || "Failed to save prescription.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Error generating/uploading prescription:", err);
      alert("Error generating prescription.");
    } finally {
      // Cleanup hidden div
      document.body.removeChild(hiddenDiv);
    }
  };

  const handleViewPrescription = async (mrn) => {
    setLoading(true);
    try {
      if (!mrn) {
        alert("MRN is missing");
        return;
      }

      // Open in new tab directly
      window.open(
        `${API_URL}appointments/openPrescription/${encodeURIComponent(mrn)}`,
        "_blank"
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error opening prescription:", error);
      alert("Failed to open prescription");
    }
  };

  const handleDeletePrescription = async (mrn) => {
    setLoading(true);
    try {
      if (!mrn) {
        alert("MRN is missing");
        return;
      }

      const res = await fetch(`${API_URL}appointments/delete`, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mrn }),
        method: "POST",
      });

      const data = await res.json();
      if (data.success) {
        setLoading(false);
        alert("Record deleted successfully!");
        navigate("/history-appointments");
      } else {
        alert(data.message || "Failed to delete record.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error deleting record:", error);
      alert("Failed to delete record");
    }
  };

  const handleViewLab = async (id) => {
    navigate(`/show-lab/${id}`);
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                searchAppointment();
              }
            }}
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
                    <TableCell>{formatToAMPM(appt.timeIn) || "N/A"}</TableCell>
                    <TableCell>{formatToAMPM(appt.timeOut) || "N/A"}</TableCell>
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
                <Label>Height:</Label>
                <p>
                  {selectedAppointment.height
                    ? `${selectedAppointment.height}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label>Weight:</Label>
                <p>
                  {selectedAppointment.weight
                    ? `${selectedAppointment.weight}`
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
                    ? `${selectedAppointment.temperature}`
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
                <p>
                  {selectedAppointment.timeIn &&
                  selectedAppointment.timeIn.trim() !== ""
                    ? formatToAMPM(selectedAppointment.timeIn)
                    : "—"}
                </p>
              </div>
              <div>
                <Label>Time Out:</Label>
                <p>
                  {selectedAppointment.timeOut &&
                  selectedAppointment.timeOut.trim() !== ""
                    ? formatToAMPM(selectedAppointment.timeIn)
                    : "—"}
                </p>
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
              <div className="pt-3 flex justify-between items-center">
                <Button
                  variant="destructive"
                  onClick={() =>
                    handleDeletePrescription(selectedAppointment.mrn)
                  }
                >
                  Delete
                </Button>

                <div className="flex gap-2">
                  {selectedAppointment.labCollection != null && (
                    <Button
                      onClick={() => handleViewLab(selectedAppointment._id)}
                    >
                      View Lab
                    </Button>
                  )}
                  <Button
                    onClick={() =>
                      handleViewPrescription(selectedAppointment.mrn)
                    }
                  >
                    View Prescription
                  </Button>
                </div>
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

      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
