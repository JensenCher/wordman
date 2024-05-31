import { Link } from "next-view-transitions";
import Image from "next/image";
import React from "react";

const AboutPage = () => {
  return (
    <div>
      AboutPage
      <div>
        <Link href={"/"}>Home</Link>
      </div>
      <div className="house relative aspect-video w-96 overflow-hidden rounded-md">
        <Image
          src={"/house.avif"}
          alt="house"
          width={1000}
          height={640}
          className=""
        />
      </div>
    </div>
  );
};

export default AboutPage;
