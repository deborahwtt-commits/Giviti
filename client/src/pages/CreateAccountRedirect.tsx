import { useEffect } from "react";
import { useLocation } from "wouter";

export default function CreateAccountRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");

    if (token) {
      localStorage.setItem("pendingInviteToken", token);
    }
    if (email) {
      localStorage.setItem("pendingInviteEmail", email);
    }

    setLocation("/entrar");
  }, [setLocation]);

  return null;
}
