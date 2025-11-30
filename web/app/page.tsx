"use client";

import { Image } from "@heroui/image";
import { ArrowRightIcon } from "@/components/icons";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <section className="w-full min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-14 lg:px-22 xl:px-38 py-12 md:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto w-full">
        <h1 className="pb-6 md:pb-12 lg:pb-16">
          <Image
            height={120}
            width={120}
            src="/logo.png"
            className="md:h-[180px] md:w-[180px] lg:h-[220px] lg:w-[220px]"
            alt="UCLM Logo"
          />
        </h1>

        <h2 className="flex flex-col font-sans space-y-6 md:space-y-8 lg:space-y-10">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            FIND YOUR WAY, THE UCLMWAY
          </div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed">
            Your personal campus guide is here! UCLMways
            <br className="hidden md:block" />
            ensures you reach your destination without hassle.
          </div>
        </h2>

        <div className="pt-10 md:pt-14 lg:pt-20">
          <button
            onClick={() => router.push("/navigation")}
            className="relative px-8 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 rounded-xl border-3 border-white text-white font-bold text-xl md:text-2xl lg:text-3xl flex items-center gap-3 md:gap-4 overflow-hidden group transition-all duration-500 hover:shadow-[0px_0px_30px_10px_rgba(255,255,255,0.7)] md:hover:shadow-[0px_0px_50px_15px_rgba(255,255,255,0.8)]"
          >
            <span className="relative z-20 flex items-center gap-2 md:gap-3 transition-all duration-500 ease-out group-hover:-translate-y-full group-hover:opacity-0">
              GET STARTED
              <ArrowRightIcon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </span>
            <span className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-blue-600 font-bold gap-2 md:gap-3 transition-all duration-500 ease-out opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100 z-20">
              GET STARTED
              <ArrowRightIcon className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </span>
            <span className="absolute bottom-[40%] right-[-20%] w-[30%] h-[70%] bg-white transition-all duration-500 ease-out group-hover:w-[300%] group-hover:h-[300%] group-hover:translate-x-5 group-hover:translate-y-[-5%] group-hover:scale-150 origin-bottom-right rotate-[-45deg] z-0 group-hover:shadow-[0px_0px_40px_12px_rgba(255,255,255,0.9)] md:group-hover:shadow-[0px_0px_60px_20px_rgba(255,255,255,1)]" />
          </button>
        </div>
      </div>
    </section>
  );
}
