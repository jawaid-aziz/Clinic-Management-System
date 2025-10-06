import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL;

const inHouseTests = [
  "CBC (Complete Blood Count) Basic Hematology",
  "Blood Sugar Random/Fasting",
  "HBsAg screening",
  "Anti HCV (Screening, ICT)",
  "Anti HIV - 1 & 2",
  "Hemoglobin",
  "Blood Group",
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
  "VDRL (Syphilis)",
];

export const ShowLab = () => {
  const [appointment, setAppointment] = useState(null);
  const [labResults, setLabResults] = useState({});
  const { id } = useParams();
const [reportDate, setReportDate] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(`${API_URL}appointments/${id}`);
        const data = await res.json();

        if (res.ok) {
          setAppointment(data.data);
        } else {
          alert(data.message || "Failed to fetch appointment data");
        }
      } catch (err) {
        alert("Error fetching appointment data");
        console.error(err);
      }
    };

    if (id) fetchAppointment();
  }, [id]);

  // handle input change for in-house lab results
  const handleInputChange = (test, value) => {
    setLabResults((prev) => ({
      ...prev,
      [test]: value,
    }));
  };

  if (!appointment) return <p className="p-4 text-gray-500">Loading...</p>;

  const isInHouse = appointment.labLocation?.toLowerCase() === "inhouse";

  const showPositiveNegative = (test) => {
    return (
      test !== "CBC (Complete Blood Count) Basic Hematology" &&
      test !== "Blood Group"
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Lab Report Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-700">MRN: {appointment.mrn}</p>
            <Badge
              variant={
                appointment.status === "Pending" ? "secondary" : "default"
              }
            >
              {appointment.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <span className="font-semibold">Name:</span> {appointment.name}
              </p>
              <p>
                <span className="font-semibold">Age:</span> {appointment.age}
              </p>
              <p>
                <span className="font-semibold">Sex:</span> {appointment.sex}
              </p>
              <p>
                <span className="font-semibold">CNIC:</span> {appointment.cnic}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Doctor:</span>{" "}
                {appointment.doctor}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {appointment.phone}
              </p>
              <p>
                <span className="font-semibold">Address:</span>{" "}
                {appointment.address}
              </p>
              <p>
                <span className="font-semibold">Lab Type:</span>{" "}
                {appointment.labLocation}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="font-semibold text-gray-800 mb-2">
              Selected Lab Tests:
            </p>

            {appointment.labs && appointment.labs.length > 0 ? (
              <div className="space-y-4">
                {appointment.labs.map((test, index) => (
                  <Card key={index} className="p-3 border">
                    <CardContent className="p-0">
                      <div className="flex flex-col space-y-2">
                        <Label className="font-semibold">{test}</Label>

                        {isInHouse && inHouseTests.includes(test) ? (
                          test ===
                          "CBC (Complete Blood Count) Basic Hematology" ? (
                            // ✅ CBC TABLE
                            <div className="overflow-x-auto">
                              <Table className="border text-sm">
                                <thead>
                                  <tr className="bg-gray-100 font-semibold">
                                    <th className="p-2 text-left">Test</th>
                                    <th className="p-2 text-left">
                                      Normal Range
                                    </th>
                                    <th className="p-2 text-left">Unit</th>
                                    <th className="p-2 text-left">Result</th>
                                  </tr>
                                </thead>
                                <TableBody>
                                  {[
                                    {
                                      name: "HB",
                                      range: "11.5 - 14.5",
                                      unit: "g/dl",
                                    },
                                    {
                                      name: "Total RBC",
                                      range: "4 - 6",
                                      unit: "x10^12/l",
                                    },
                                    {
                                      name: "HCT",
                                      range: "32 - 46",
                                      unit: "%",
                                    },
                                    {
                                      name: "MCV",
                                      range: "75 - 85",
                                      unit: "fl",
                                    },
                                    {
                                      name: "MCH",
                                      range: "26 - 32",
                                      unit: "pg",
                                    },
                                    {
                                      name: "MCHC",
                                      range: "30 - 35",
                                      unit: "g/dl",
                                    },
                                    {
                                      name: "Platelets",
                                      range: "140 - 450",
                                      unit: "x10^3/µL",
                                    },
                                    {
                                      name: "WBC",
                                      range: "6 - 13",
                                      unit: "10^3/µl",
                                    },
                                    {
                                      name: "Neutrophils",
                                      range: "20 - 75",
                                      unit: "%",
                                    },
                                    {
                                      name: "Lymphocytes",
                                      range: "30 - 75",
                                      unit: "%",
                                    },
                                    {
                                      name: "Eosinophils",
                                      range: "1 - 5",
                                      unit: "%",
                                    },
                                    {
                                      name: "Monocytes",
                                      range: "2 - 6",
                                      unit: "%",
                                    },
                                  ].map((row) => (
                                    <TableRow key={row.name}>
                                      <TableCell className="font-medium">
                                        {row.name}
                                      </TableCell>
                                      <TableCell>{row.range}</TableCell>
                                      <TableCell>{row.unit}</TableCell>
                                      <TableCell>
                                        <Input
                                          type="text"
                                          placeholder="Enter result"
                                          value={labResults[row.name] || ""}
                                          onChange={(e) =>
                                            handleInputChange(
                                              row.name,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : test === "Blood Group" ? (
                            // ✅ BLOOD GROUP FIELDS
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex flex-col w-full">
                                  <Label>ABO Group</Label>
                                  <select
                                    className="border rounded-md p-2"
                                    value={labResults["ABO Group"] || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "ABO Group",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                  </select>
                                </div>

                                <div className="flex flex-col w-full">
                                  <Label>Rhesus (Rh)</Label>
                                  <select
                                    className="border rounded-md p-2"
                                    value={labResults["Rhesus"] || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "Rhesus",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">Select</option>
                                    <option value="Positive">
                                      Positive (+)
                                    </option>
                                    <option value="Negative">
                                      Negative (-)
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // ✅ ALL OTHER IN-HOUSE TESTS (Positive/Negative Option)
                            <div className="flex gap-2 items-center">
                              <Label>Result:</Label>
                              <select
                                className="border rounded-md p-1"
                                value={labResults[test] || ""}
                                onChange={(e) =>
                                  handleInputChange(test, e.target.value)
                                }
                              >
                                <option value="">Select</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                              </select>
                            </div>
                          )
                        ) : (
                          // ✅ OUTSOURCE TESTS
                          <Badge variant="outline" className="w-fit">
                            Outsourced Test
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No lab tests assigned.</p>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center text-sm">
            <p>
              <span className="font-semibold">Lab Collection:</span>{" "}
              <Badge
                variant={
                  appointment.labCollection === "Pending"
                    ? "secondary"
                    : "default"
                }
              >
                {appointment.labCollection}
              </Badge>
            </p>
<div className="flex items-center gap-2">
  <Label className="font-semibold">Report Date:</Label>
  {appointment.labReportDate ? (
    <span>
      {new Date(appointment.labReportDate).toLocaleDateString()}
    </span>
  ) : (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-[200px] justify-start text-left font-normal ${
            !reportDate && "text-muted-foreground"
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={reportDate}
          onSelect={setReportDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )}
</div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};
