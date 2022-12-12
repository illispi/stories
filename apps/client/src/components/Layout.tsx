import { m } from "framer-motion";

const Layout = ({ children }) => (
  <m.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
  >
    {children}
  </m.div>
);
export default Layout;
