import Link from "next/link";
import React from "react";

const NavBar = () => {
  return (
    <div className="sticky top-0 flex h-12 w-full items-center bg-gradient-to-b from-blue-200 to-blue-300">
      <Link href={"/"}>
        <a className="mx-2 text-2xl font-semibold sm:hidden">
          Schizo... stories
        </a>
      </Link>
      <Link href={"/"}>
        <a className="mx-2 hidden text-2xl font-semibold sm:flex">
          Schizophrenia stories
        </a>
      </Link>
    </div>
  );
};

export default NavBar;
