"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";
import { Image } from "@heroui/image";

interface FeatureItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export default function AFKModal() {
  const [isAFK, setIsAFK] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const featureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const features: FeatureItem[] = [
    {
      id: 1,
      title: "Search Location",
      subtitle: "Find your Way Effortlessly",
      description:
        "Quickly locate buildings, rooms, and facilities with our intuitive search tool",
      image: "/idlepic.png",
    },
    {
      id: 2,
      title: "Enrollment Stations",
      subtitle: "Easy Registration Process",
      description:
        "Quickly locate buildings, rooms, and facilities with our intuitive search tool",
      image: "/idlepic2.png",
    },
    {
      id: 3,
      title: "Select Specific Gates",
      subtitle: "Streamlined Access Points",
      description:
        "Quickly locate buildings, rooms, and facilities with our intuitive search tool",
      image: "/idlepic3.png",
    },
  ];

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsAFK(true), 30000);
  };

  const startFeatureCarousel = () => {
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    featureIntervalRef.current = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 8000);
  };

  const handleFeatureChange = (index: number) => {
    setActiveFeature(index);
    if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    startFeatureCarousel();
  };
  useEffect(() => {
    resetTimer();

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keypress",
      "touchstart",
      "scroll",
      "click",
    ];

    const handleUserActivity = () => {
      if (isAFK) {
        setIsAFK(false);
      }
      resetTimer();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    const handleClick = () => {
      if (isAFK && pathname === "/navigation") {
        startTransition(() => {
          router.push("/");
        });
      }
    };

    document.addEventListener("click", handleClick);

    // Clean up all event listeners
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });

      document.removeEventListener("click", handleClick);
    };
  }, [pathname, isAFK, router]);

  useEffect(() => {
    if (!isPending) {
      setIsAFK(false);
    }
  }, [isPending]);

  useEffect(() => {
    if (isAFK) {
      startFeatureCarousel();
    } else {
      if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    }

    return () => {
      if (featureIntervalRef.current) clearInterval(featureIntervalRef.current);
    };
  }, [isAFK]);

  return (
    <Modal isOpen={isAFK} onOpenChange={setIsAFK} size="full" backdrop="opaque">
      <ModalContent className="fixed inset-0 flex items-center justify-center">
        <section className="w-full h-full bg-idlebg bg-cover bg-no-repeat bg-center flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-8">
          <ModalBody className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-sm sm:text-base md:text-lg opacity-80">
                Navigate
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-2 md:mt-4">
                Explore Our Interactive Navigation Features
              </h2>
              <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-medium mt-3 md:mt-4 max-w-3xl mx-auto">
                UCLMWays offers a seamless way to navigate our campus. With
                features designed for convenience, finding your way has never
                been easier.
              </h3>
            </div>

            {/* Feature Showcase */}
            <div className="relative flex flex-col items-center">
              {/* Main Feature Display */}
              <div className="w-full max-w-6xl relative overflow-hidden rounded-xl shadow-2xl bg-black/20 backdrop-blur-sm p-6 md:p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  <div className="flex justify-center lg:order-2 transition-opacity duration-500">
                    <div className="relative w-full aspect-square max-w-md">
                      {features.map((feature, index) => (
                        <div
                          key={feature.id}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                            index === activeFeature
                              ? "opacity-100 scale-100"
                              : "opacity-0 scale-95"
                          }`}
                        >
                          <Image
                            src={feature.image}
                            alt={feature.title}
                            width={500}
                            height={500}
                            className="object-contain w-full h-full rounded-lg shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:order-1 flex flex-col justify-center text-center lg:text-left">
                    {features.map((feature, index) => (
                      <div
                        key={feature.id}
                        className={`transition-all duration-700 ease-in-out ${
                          index === activeFeature
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8 absolute"
                        }`}
                      >
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-judson mt-2 text-white/90">
                          {feature.subtitle}
                        </p>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-light mt-4 text-white/80 max-w-lg mx-auto lg:mx-0">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center mt-8 md:mt-10 space-x-3">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleFeatureChange(index)}
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                        activeFeature === index
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`View feature ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <p className="mt-8 text-center font-bold text-lg sm:text-xl md:text-2xl animate-pulse text-white">
                Click Anywhere to Return
              </p>
            </div>
          </ModalBody>
        </section>
      </ModalContent>
    </Modal>
  );
}
