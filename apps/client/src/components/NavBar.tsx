import Link from "next/link";
import React, { useState } from "react";

const Links = () => {
  return (
    <div className="hidden items-center justify-end lg:flex">
      <Link href={"/stats"}>
        <div className="mx-2 text-xl font-semibold">Statistics</div>
      </Link>
    </div>
  );
};

const Hamburger: React.FC<{
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ menuOpen, setMenuOpen }) => {
  return (
    <div className="flex items-center justify-center transition-transform active:scale-125 lg:hidden">
      <button onClick={() => setMenuOpen(!menuOpen)}>
        {!menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  //BUG schizophrenia should be on left corner
  return (
    <div className="sticky top-0 flex w-full items-center justify-between bg-gradient-to-b from-blue-200 to-blue-300 p-3">
      <Link href={"/"}>
        <div className="mx-2 text-2xl font-semibold sm:hidden">
          Schizo... stories
        </div>
      </Link>
      <Link href={"/"}>
        <div className="mx-2 hidden text-2xl font-semibold sm:flex">
          Schizophrenia stories
        </div>
      </Link>
      <Hamburger menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Links></Links>
    </div>
  );
};

export default NavBar;
