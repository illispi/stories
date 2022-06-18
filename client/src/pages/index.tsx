import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const hello = trpc.useQuery(["getUserById", "1655557703221"]);
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p className="m-16 font-bold bg-red-400">{hello.data.name}</p>
    </div>
  );
};

export default Home;
