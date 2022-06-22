import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

import React from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { trpc } from "../utils/trpc";

type Gender = "male" | "female" | "other";

const Home: NextPage = () => {
  const utils = trpc.useContext();
  const [name, setName] = useState();
  const [gender, setGender] = useState<Gender>("male");

  const allUsers = trpc.useQuery(["getAllUsers"]);

  //NOTE loading state

  // if (!hello.data) {
  //   return <div className="m-16 font-bold bg-red-400 text-6xl">Loading...</div>;
  // }

  const createUser = trpc.useMutation("createUser");

  const handleSubmit = (event) => {
    event.preventDefault();
    createUser.mutate(
      { firstName: name, gender: gender },
      { onSuccess: () => utils.invalidateQueries() }
    );
  };
  const onRadioChange = (event) => {
    event.preventDefault();
    setGender(event.target.value);
  };

  return (
    <div>
      <div>
        {allUsers.data?.map((firstName) => (
          <li key={firstName.first_name}>{firstName.first_name}</li>
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
        <div onChange={onRadioChange}>
          <label>
            Gender:
            <input
              type="radio"
              name="gender"
              value="male"
              id="male"
              defaultChecked
            ></input>
            <label htmlFor="male">male</label>
            <input
              type="radio"
              name="gender"
              value="female"
              id="female"
            ></input>
            <label htmlFor="female">female</label>
            <input type="radio" name="gender" value="other" id="other"></input>
            <label htmlFor="other">other</label>
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;
