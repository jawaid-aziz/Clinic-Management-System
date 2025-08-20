import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/context/RoleProvider";

// Hardcoded role-based PINs
const ROLE_PINS = {
  reception: "1234",
  paeds: "1234",
  gynae: "1234",
};

export const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [pin, setPin] = useState("");
  const [open, setOpen] = useState(false);
  
  const navigate = useNavigate();
  const { setRole } = useRole();
  const { role } = useRole();

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setPin("");
    setOpen(true);
  };

    useEffect(() => {
    if (role) {
      navigate("/"); // already logged in, push to home
    }
  }, [role, navigate]);

  const handleLogin = () => {
    if (pin === ROLE_PINS[selectedRole]) {
      console.log(`Logged in as ${selectedRole}`);
      localStorage.setItem("role", selectedRole);
      setRole(selectedRole);
      navigate(`/`);
    } else {
      // Show error message
      console.error("Invalid PIN");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold mb-4">Select Your Role</h1>

      <Button onClick={() => handleRoleClick("reception")} className="w-40">
        Reception
      </Button>
      <Button onClick={() => handleRoleClick("paeds")} className="w-40">
        Paeds
      </Button>
      <Button onClick={() => handleRoleClick("gynae")} className="w-40">
        Gynae
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Enter PIN for {selectedRole?.toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-2"
          />

          <DialogFooter>
            <Button onClick={handleLogin}>Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
