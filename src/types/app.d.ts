/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("../auth/lucia").Auth;
  type DatabaseUserAttributes = {
    role: "user" | "admin";
    username: string | null;
  };
  type DatabaseSessionAttributes = {
    // role: "user" | "admin";
    // username: string | null;
  };
}
