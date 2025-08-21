import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const AddPatient = () => {
  const [form, setForm] = useState({
    mrn: "",
    name: "",
    sex: "",
    age: "",
    date: "",
    time: "",
    doctor: "",
    cnic: "",
    phone: "",
    weight: "",
    height: "",
    bp: "",
    pulse: "",
    temperature: "",
    vco: false,
    gestation: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments/add-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: form.age,
          phone: form.phone,
          date: form.date,
          time: form.time,
          doctor: form.doctor,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Appointment booked successfully ✅");
        setForm({
          mrn: "",
          name: "",
          sex: "",
          age: "",
          date: "",
          time: "",
          doctor: "",
          cnic: "",
          phone: "",
          weight: "",
          height: "",
          bp: "",
          pulse: "",
          temperature: "",
          vco: false,
          gestation: "",
        });
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center p-6">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center">Add a Patient</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>MRN</Label>
              <Input
                value={form.mrn}
                onChange={(e) => handleChange("mrn", e.target.value)}
                placeholder="Enter MRN"
              />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter Name"
              />
            </div>
            <div>
              <Label>Sex</Label>
              <RadioGroup
                value={form.sex}
                onValueChange={(val) => handleChange("sex", val)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>Age</Label>
              <Input
                value={form.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="Enter Age"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Doctor Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Doctor</Label>
              <RadioGroup
                value={form.doctor}
                onValueChange={(val) => handleChange("doctor", val)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dr_ejaz" id="dr_ejaz" />
                  <Label htmlFor="dr_ejaz">Dr. Ejaz</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dr_salma" id="dr_salma" />
                  <Label htmlFor="dr_salma">Dr. Salma</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label>CNIC</Label>
              <Input
                value={form.cnic}
                onChange={(e) => handleChange("cnic", e.target.value)}
                placeholder="Enter CNIC"
              />
            </div>
          </div>

          <div>
            <Label>Contact No</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Enter Contact Number"
            />
          </div>

          <Separator />

          {/* Vitals */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Weight</Label>
              <Input
                value={form.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="kg"
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="cm"
              />
            </div>
            <div>
              <Label>B.P</Label>
              <Input
                value={form.bp}
                onChange={(e) => handleChange("bp", e.target.value)}
                placeholder="mmHg"
              />
            </div>
            <div>
              <Label>Pulse</Label>
              <Input
                value={form.pulse}
                onChange={(e) => handleChange("pulse", e.target.value)}
                placeholder="bpm"
              />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input
                value={form.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                placeholder="°C"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.vco}
                onCheckedChange={(val) => handleChange("vco", val)}
                id="vco"
              />
              <Label htmlFor="vco">VCO</Label>
            </div>
          </div>

          <Separator />

          {/* Gestation */}
          <div>
            <Label>Gestation</Label>
            <RadioGroup
              value={form.gestation}
              onValueChange={(val) => handleChange("gestation", val)}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple" id="multiple" />
                <Label htmlFor="multiple">Multiple</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit}>Book the Appointment</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
