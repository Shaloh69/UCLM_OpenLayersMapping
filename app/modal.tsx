"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import {Image} from "@heroui/image";


export default function AFKModal() {
  const [isAFK, setIsAFK] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to reset inactivity timer
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsAFK(true), 30000); // 30 seconds for testing
  };

  useEffect(() => {
    const handleClick = () => {
      setIsAFK(false); // Close modal if user clicks
      resetTimer();
    };

    window.addEventListener("click", handleClick);
    resetTimer(); // Start timer on mount

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <Modal isOpen={isAFK} onOpenChange={setIsAFK} size="full" backdrop="opaque">
      <ModalContent className="fixed inset-0 flex ">
      <section className="pl-32 bg-idlebg bg-cover bg-no-repeat bg-center h-screen w-screen flex flex-col font-sans">
          <ModalBody>
            <h1 className="text-[15px] pt-8">
                Navigate
            </h1>
            <h2 className="text-[32px] font-bold pt-5">
                Explore Our Interactive <br />
                Navigation Features
            </h2>
            <h3 className="text-[14px] font-medium">
            UCLMWays offers a seamless way to navigate our campus. With features <br />
            designed for convenience, finding your way have never been easier.
            </h3>
            <h4 className="flex flex-row pt-8">
                <div className="pt-5">
                    <Image height={200} src="/idlepic.png" width={200} />
                    <p className="font-judson">
                        Search Location: Find your <br />
                        Way Effortlessly
                    </p>
                    <p className="font-light text-[12px] pt-5">
                    Quickly locate buildings, rooms, and <br/>
                    facilities with our intuitive search tool
                    </p>
                </div>
                <div className="pl-40 pt-5">
                    <Image height={200} src="/idlepic2.png" width={200} />
                    <p className="font-judson">
                        Enrollment Stations: Easy <br />
                        Registration Process
                    </p>
                    <p className="font-light text-[12px] pt-5">
                    Quickly locate buildings, rooms, and <br/>
                    facilities with our intuitive search tool
                    </p>
                    <p className="font-bold pt-10">
                        Click Anywhere to Return
                    </p>
                </div>
                <div className="pl-40 pt-5">
                    <Image height={200} src="/idlepic3.png" width={200} />
                    <p className="font-judson">
                        Select Specific Gates: <br />
                        Streamlined Access Points
                    </p>
                    <p className="font-light text-[12px] pt-5">
                    Quickly locate buildings, rooms, and <br/>
                    facilities with our intuitive search tool
                    </p>
                </div>
            </h4>
          </ModalBody>
        </section>
      </ModalContent>
    </Modal>
  );
}
