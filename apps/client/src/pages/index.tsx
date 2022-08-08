import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "../utils/trpc";
import Link from "next/link";
import axios from "axios";

const Home: NextPage = () => {

  //TODO loading state, ssr is true so might not be necessary

  // if (!hello.data) {
  //   return <div className="m-16 font-bold bg-red-400 text-6xl">Loading...</div>;
  // }

  //TODO dont invalidate every query, but select one to invalidate


  return (
    <div>
      <Link href="/personalQuestions">
        <a>Personal questions</a>
      </Link>  
    </div>
  );
};

export default Home;
