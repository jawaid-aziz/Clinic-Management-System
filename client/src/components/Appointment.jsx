import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";
import { renderAsync } from "docx-preview";
import { useNavigate } from "react-router-dom";

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

  // Ref to trigger hidden input
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/appointments/${id}`);
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
        // update local appointment state too
        setAppointment((prev) => ({
          ...prev,
          timeIn,
          timeOut,
        }));
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
    // if (!docxContent || !appointment) {
    //   alert("Please choose a template and make sure appointment is loaded.");
    //   return;
    // }

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
        <p><strong>Name:</strong> ${appointment.name}</p>
        <p><strong>Sex:</strong> ${appointment.sex}</p>
        <p><strong>Age:</strong> ${appointment.age}</p>
        <p><strong>Department:</strong> ${appointment.doctor}</p>
        <p><strong>Date:</strong> ${new Date(
          appointment.date
        ).toLocaleDateString()}</p>
        <p><strong>Time In:</strong> ${timeIn}</p>
        <p><strong>Time Out:</strong> ${timeOut}</p>
        <p><strong>Phone:</strong> ${appointment.phone}</p>
        <p><strong>CNIC:</strong> ${appointment.cnic}</p>
        <p><strong>Gestation:</strong> ${appointment.gestation}</p>
        <p><strong>Height:</strong> ${appointment.height} cm</p>
        <p><strong>Weight:</strong> ${appointment.weight} kg</p>
        <p><strong>BP:</strong> ${appointment.bp}</p>
        <p><strong>Pulse:</strong> ${appointment.pulse}</p>
        <p><strong>Temperature:</strong> ${appointment.temperature} °C</p>
        <p><strong>VCO:</strong> ${appointment.vco ? "Yes" : "No"}</p>
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
      formData.append("mrn", appointment.mrn); // backend uses this for filename
      formData.append("file", pdfBlob, `${appointment.mrn}.pdf`);

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
          navigate("/pending-appointments");
        } else {
          alert(data.message || "Failed to save prescription.");
        }
      } catch (err) {
        console.error("Error uploading prescription:", err);
        alert("Error uploading prescription.");
      }
    });
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
              <strong>Doctor:</strong> {appointment.doctor}
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
              <strong>Gestation:</strong> {appointment.gestation}
            </p>
            <p>
              <strong>Height:</strong> {appointment.height} cm
            </p>
            <p>
              <strong>Weight:</strong> {appointment.weight} kg
            </p>
            <p>
              <strong>BP:</strong> {appointment.bp}
            </p>
            <p>
              <strong>Pulse:</strong> {appointment.pulse}
            </p>
            <p>
              <strong>Temperature:</strong> {appointment.temperature} °C
            </p>
            <p>
              <strong>VCO:</strong> {appointment.vco ? "Yes" : "No"}
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
    </div>
  );
};
