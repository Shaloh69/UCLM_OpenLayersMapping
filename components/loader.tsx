"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@heroui/spinner";

export default function LoadingAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsVisible(true);

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-opacity-70 bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Spinner
          classNames={{ label: "text-foreground mt-4 text-lg font-semibold text-blue-600" }}
          label="Loading..."
          variant="wave"
        />
      </div>
    </div>
  );
}
