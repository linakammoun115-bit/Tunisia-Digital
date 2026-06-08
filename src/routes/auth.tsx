import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

 
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [step, setStep] = useState(1);

  

    const fakeCode = Math.floor(100000 + Math.random() * 900000).toString();

    setGeneratedCode(fakeCode);
    setStep(2);

    alert("Code (TEST): " + fakeCode);
  };


 