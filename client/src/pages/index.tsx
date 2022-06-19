import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const hello = trpc.useQuery(["getUserById", null]);
  if (!hello.data) {
    return <div className="m-16 font-bold bg-red-400 text-6xl">Loading...</div>;
  }
  return (
    <div>
      <p className="m-16 font-bold bg-red-400 text-6xl">{hello.data}</p>
    </div>
  );
};

export default Home;
