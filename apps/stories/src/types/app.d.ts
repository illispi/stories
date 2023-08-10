/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("../auth/lucia").Auth;
  type DatabaseUserAttributes = { role: "user" | "admin" };
  type DatabaseSessionAttributes = { role: "user" | "admin" };
}
