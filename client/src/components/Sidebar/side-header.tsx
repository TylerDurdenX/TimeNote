import Image from "next/image";
import React from "react";

const sideheader = () => {
  return (
    <>
      <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
        <Image src="/logo.svg" alt="Logo" width={60} height={60}></Image>
        <div>
          <h3 className="font-bold text-black text-md tracking-wide dark:text-gray-200">
            {" "}
            Lynk247
          </h3>
        </div>
      </div>
      {/* <div className='flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700'></div> */}
    </>
  );
};

export default sideheader;
