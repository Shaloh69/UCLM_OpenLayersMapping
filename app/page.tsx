"use client";

import {Image} from "@heroui/image";
import { ArrowRightIcon } from "@/components/icons";

import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();

  return (
    <section className = "pl-40">
      <h1 className = "pb-10 flex">
      <Image height={150} src="/logo.png" width={150} />
      </h1>
      <h2 className= "pt-50 flex flex-col font-sans">
        <div className= "text-[35px] font-bold">
          FIND YOUR WAY, THE UCLMWAY
        </div>
        <div className="pt-10 text-[22px]">
          Your personal campus guide is here! UCLMways <br />
          ensures you reach your destination without hassle.
        </div>
      </h2>
      <h3 className="pt-10 font-jomhuria font-bold text-[30px] ">
        <button onClick={() => router.push("/navigation")} className="relative px-6 py-3 rounded-lg border-2 border-white text-white font-bold flex items-center gap-3 overflow-hidden group transition-all duration-500 hover:shadow-[0px_0px_30px_7px_rgba(255,255,255,0.8)]">
          <span className="relative z-20 flex items-center gap-2 transition-all duration-500 ease-out group-hover:-translate-y-full group-hover:opacity-0">
            GET STARTED
            <ArrowRightIcon />
          </span>
          <span className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-blue-600 font-bold gap-2 transition-all duration-500 ease-out opacity-0 translate-y-full group-hover:translate-y-0 group-hover:opacity-100 z-20">
            GET STARTED
            <ArrowRightIcon />
          </span>
          <span className="absolute bottom-[40%] right-[-20%] w-[30%] h-[70%] bg-white transition-all duration-500 ease-out group-hover:w-[300%] group-hover:h-[300%] group-hover:translate-x-5 group-hover:translate-y-[-5%] group-hover:scale-150 origin-bottom-right rotate-[-45deg] z-0 group-hover:shadow-[0px_0px_50px_15px_rgba(255,255,255,1)]"/>
        </button>
      </h3>
    </section>
  );
}
