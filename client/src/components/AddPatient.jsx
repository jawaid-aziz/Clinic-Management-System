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
              <Input placeholder="Enter MRN" />
            </div>
            <div>
              <Label>Patient Name</Label>
              <Input placeholder="Enter Name" />
            </div>
            <div>
              <Label>Sex</Label>
              <RadioGroup className="flex space-x-4">
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
              <Input placeholder="Enter Age" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" />
            </div>
          </div>

          <Separator />

          {/* Doctor Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Doctor</Label>
              <RadioGroup>
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
              <Input placeholder="Enter CNIC" />
            </div>
          </div>

          <div>
            <Label>Contact No</Label>
            <Input placeholder="Enter Contact Number" />
          </div>

          <Separator />

          {/* Vitals */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Weight</Label>
              <Input placeholder="kg" />
            </div>
            <div>
              <Label>Height</Label>
              <Input placeholder="cm" />
            </div>
            <div>
              <Label>B.P</Label>
              <Input placeholder="mmHg" />
            </div>
            <div>
              <Label>Pulse</Label>
              <Input placeholder="bpm" />
            </div>
            <div>
              <Label>Temperature</Label>
              <Input placeholder="°C" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="vco" />
              <Label htmlFor="vco">VCO</Label>
            </div>
          </div>

          <Separator />

          {/* Gestation */}
          <div>
            <Label>Gestation</Label>
            <RadioGroup className="flex space-x-6 mt-2">
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
          <Button>Book the Appointment</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
