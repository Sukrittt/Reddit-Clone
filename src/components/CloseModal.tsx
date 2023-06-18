"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/ui/Button";

const CloseModal = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isMounted) {
    window.addEventListener("keydown", (event) => {
      if (event.code === "Escape") {
        router.back();
      }
    });
  }

  return (
    <Button
      variant="subtle"
      className="h-6 w-6 p-0 rounded-md"
      arial-label="close modal"
      onClick={() => router.back()}
    >
      <X className="h-4 w-4" />
    </Button>
  );
};

export default CloseModal;
