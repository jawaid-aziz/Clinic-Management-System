import { useState } from "react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";

const API_URL = import.meta.env.VITE_API_URL;

export const AddAppointment = () => {
  const [form, setForm] = useState({
    mrn: "",
    name: "",
    sex: "",
    age: "",
    date: "",
    timeIn: "",
    timeOut: "",
    doctor: "",
    cnic: "",
    phone: "",
    address: "",
    weight: "",
    height: "",
    bp: "",
    pulse: "",
    temperature: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}appointments/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mrn: form.mrn,
          name: form.name,
          sex: form.sex,
          age: form.age,
          date: form.date,
          timeIn: form.timeIn,
          timeOut: form.timeOut,
          doctor: form.doctor,
          cnic: form.cnic,
          phone: form.phone,
          address: form.address,
          height: form.height,
          weight: form.weight,
          bp: form.bp,
          pulse: form.pulse,
          temperature: form.temperature,
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
          timeIn: "",
          timeOut: "",
          doctor: "",
          cnic: "",
          phone: "",
          address: "",
          weight: "",
          height: "",
          bp: "",
          pulse: "",
          temperature: "",
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
          <CardTitle className="text-xl text-center">
            Add an Appointment
          </CardTitle>
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
              <Label>Time-in</Label>
              <Input
                type="time"
                value={form.timeIn}
                onChange={(e) => handleChange("timeIn", e.target.value)}
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
                  <RadioGroupItem value="paediatrics" id="paediatrics" />
                  <Label htmlFor="paediatrics">Dr. Ejaz</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gynae" id="gynae" />
                  <Label htmlFor="gynae">Dr. Salma</Label>
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
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter Address"
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
                placeholder="kg/g"
              />
            </div>
            <div>
              <Label>Height</Label>
              <Input
                value={form.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="cm/ft"
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
                placeholder="°F/°C"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label>Time-out</Label>
            <Input
              type="time"
              value={form.timeOut}
              onChange={(e) => handleChange("timeOut", e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit}>Book the Appointment</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
