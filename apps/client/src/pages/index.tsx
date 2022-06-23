import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "../utils/trpc";
import type { createUserType } from "zod-types";


const Home: NextPage = () => {
  const utils = trpc.useContext();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<createUserType["gender"]>("male");

  const allUsers = trpc.useQuery(["getAllUsers"]);

  //TODO loading state, ssr is true so might not be necessary

  // if (!hello.data) {
  //   return <div className="m-16 font-bold bg-red-400 text-6xl">Loading...</div>;
  // }

  const createUser = trpc.useMutation("createUser");

  //TODO dont invalidate every query, but select one to invalidate

  const handleSubmit = (event) => {
    event.preventDefault();
    createUser.mutate(
      { firstName: name, gender: gender },
      { onSuccess: () => utils.invalidateQueries() }
    );
    setName("");
  };
  const onRadioChange = (event) => {
    setGender(event.target.value);
    //NOTE below updates too slow, but it works in practice
    console.log(gender);
  };

  return (
    <div>
      <div>
        {allUsers.data?.map((firstName, i) => (
          <li key={`${firstName.first_name}${i}`}>{firstName.first_name}</li>
        )) ?? <p>No users found</p>}
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Gender:
          <div>
            <input
              type="radio"
              name="gender"
              value="male"
              id="male"
              onChange={onRadioChange}
              checked={gender === "male"}
            ></input>
            <label htmlFor="male">male</label>
            <input
              type="radio"
              name="gender"
              value="female"
              id="female"
              onChange={onRadioChange}
              checked={gender === "female"}
            ></input>
            <label htmlFor="female">female</label>
            <input
              type="radio"
              name="gender"
              value="other"
              id="other"
              onChange={onRadioChange}
              checked={gender === "other"}
            ></input>
            <label htmlFor="other">other</label>
          </div>
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;

