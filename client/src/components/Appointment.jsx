import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { renderAsync } from "docx-preview";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { set } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

export const Appointment = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [docxContent, setDocxContent] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const navigate = useNavigate();

  const [labType, setLabType] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);

  const inHouseTests = [
    "CBC (Complete Blood Count) Basic Hematology",
    "Blood Sugar Random/Fasting",
    "HBsAg screening",
    "Anti HCV (Screening, ICT)",
    "Anti HIV - 1 & 2",
    "Hemoglobin",
    "Blood Group"
  ];
  const outSourceTests = [
    "ICT malaria",
    "LFTs",
    "RFTs",
    "Blood Urea",
    "ALT",
    "Serum Creatinine",
    "AST",
    "ALP",
    "Serum Uric Acid",
    "VDRL (Syphilis)"
  ];

  const formatToAMPM = (timeStr) => {
    let [hour, minute] = timeStr.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // convert 0 → 12 and 13–23 → 1–11
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  // Ref to trigger hidden input
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`${API_URL}appointments/${id}`);
        const data = await res.json();

        if (data.success) {
          setAppointment(data.data);
          setTimeIn(data.data.timeIn || "");
          setTimeOut(data.data.timeOut || "");
        } else {
          setError(data.message || "Failed to fetch appointment");
        }
      } catch (err) {
        setError("Something went wrong while fetching appointment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleSaveTimes = async () => {
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
        // update local appointment state too
        setAppointment((prev) => ({
          ...prev,
          timeIn,
          timeOut,
        }));
        alert("Times updated successfully!");
      } else {
        setLoading(false);
        alert(data.message || "Failed to update times");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Something went wrong while saving times.");
    }
  };
  
  const saveLabTests = async () => {
    setLoading(true);
    if (!labType || selectedTests.length === 0) {
      alert("Please select lab type and tests.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}appointments/${id}/saveLabTests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labType, selectedTests }),
      });

      const data = await res.json();
      if (data.success) {
        setLoading(false);
        alert("Lab tests saved successfully!");
      } else {
        setLoading(false);
        alert(data.message || "Failed to save lab tests");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Something went wrong while saving lab tests.");
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
    if (!appointment) {
      alert("Make sure appointment is loaded.");
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
      <p><strong>MRN:</strong> ${appointment.mrn}</p>
        <p><strong>Name:</strong> ${appointment.name}</p>
        <p><strong>Age:</strong> ${appointment.age}</p>
        <p><strong>Sex:</strong> ${appointment.sex}</p>
        <p><strong>Phone:</strong> ${appointment.phone}</p>
        <p><strong>CNIC:</strong> ${appointment.cnic}</p>
        <p><strong>Date:</strong> ${new Date(
          appointment.date
        ).toLocaleDateString()}</p>
        <p><strong>Height:</strong> ${appointment.height}</p>
        <p><strong>Weight:</strong> ${appointment.weight}</p>
        <p><strong>BP:</strong> ${appointment.bp}</p>
        <p><strong>Pulse:</strong> ${appointment.pulse}</p>
        <p><strong>Temperature:</strong> ${appointment.temperature}</p>
        <p><strong>Address:</strong> ${appointment.address}</p>
        <p><strong>VCO:</strong> ${appointment.vco ? "Yes" : "No"}</p>
      </div>

      <hr style="margin: 12px 0;" />

      <div style="font-size:9pt; text-align:right;">
        <p><strong>Time In:</strong> ${timeIn && timeIn.trim() !== "" ? formatToAMPM(timeIn) : "—"}</p>
        <p><strong>Time Out:</strong> ${timeOut && timeOut.trim() !== "" ? formatToAMPM(timeOut) : "—"}</p>
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
      formData.append("mrn", appointment.mrn);
      formData.append("file", pdfBlob, `${appointment.mrn}.pdf`);

      if (selectedTemplate) {
        formData.append("templateName", selectedTemplate.name);
      }
      console.log(formData.get("mrn"));
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
        navigate("/pending-appointments");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTitle>No Appointment Found</AlertTitle>
          <AlertDescription>
            Could not find appointment with ID {id}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>{appointment.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            MRN: {appointment.mrn} | {appointment.sex}, {appointment.age} yrs
          </p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Department:</strong> {appointment.doctor}
            </p>
            <p>
              <strong>Status:</strong> {appointment.status}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appointment.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Phone:</strong> {appointment.phone}
            </p>
            <p>
              <strong>CNIC:</strong> {appointment.cnic}
            </p>
            <p>
              <strong>Height:</strong> {appointment.height}
            </p>
            <p>
              <strong>Weight:</strong> {appointment.weight}
            </p>
            <p>
              <strong>BP:</strong> {appointment.bp}
            </p>
            <p>
              <strong>Pulse:</strong> {appointment.pulse}
            </p>
            <p>
              <strong>Temperature:</strong> {appointment.temperature}
            </p>
            <p>
              <strong>VCO:</strong> {appointment.vco ? "Yes" : "No"}
            </p>
            <p>
              <strong>Address:</strong> {appointment.address}
            </p>
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
          </div>
          <div className="flex gap-2 mt-2">
            <Button onClick={handleSaveTimes}>Save Times</Button>
          </div>

          <Separator />

          {/* ✅ Lab Type Selection */}
          <div>
            <label className="text-xs font-semibold mb-1 block">
              Select Lab
            </label>
            <Select
              value={labType}
              onValueChange={(val) => {
                setLabType(val);
                setSelectedTests([]);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Lab Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="InHouse">InHouse</SelectItem>
                <SelectItem value="Outsource">Outsource</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ✅ Dynamic Test Selection */}
          {labType && (
            <div>
              <label className="text-xs font-semibold mb-1 block">
                Select Tests ({labType})
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    {selectedTests.length > 0
                      ? selectedTests.join(", ")
                      : "Choose Tests"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-3 space-y-2">
                  {(labType === "InHouse" ? inHouseTests : outSourceTests).map(
                    (test) => (
                      <div key={test} className="flex items-center space-x-2">
                        <Checkbox
                          id={test}
                          checked={selectedTests.includes(test)}
                          onCheckedChange={(checked) => {
                            setSelectedTests((prev) =>
                              checked
                                ? [...prev, test]
                                : prev.filter((t) => t !== test)
                            );
                          }}
                        />
                        <Label
                          htmlFor={test}
                          className="text-sm cursor-pointer select-none"
                        >
                          {test}
                        </Label>
                      </div>
                    )
                  )}
                </PopoverContent>
              </Popover>
            </div>
          )}
          {labType && selectedTests.length > 0 && (
          <div className="flex gap-2 mt-2">
            <Button onClick={saveLabTests}>Save Lab Tests</Button>
          </div>
          )}
          <Separator />

          <div className="text-sm space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".doc,.docx"
              className="hidden"
            />
            <Button onClick={handleChooseTemplate}>Choose Template</Button>
            <Button onClick={handleGeneratePrescription}>
              Complete Appointment & Generate Prescription
            </Button>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground mt-2">
                Selected: {selectedTemplate.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
