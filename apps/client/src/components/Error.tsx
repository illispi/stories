import { AnimatePresence, motion } from "framer-motion";

const variants = {
  enter: () => {
    return {
      y: -100,
      opacity: 0,
    };
  },
  center: {
    y: 0,
    opacity: 1,
  },
  exit: () => {
    return {
      y: -100,
      opacity: 0,
    };
  },
};

const Error: React.FC<{
  message: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ message, setError }) => {
  if (message) {
    setTimeout(() => {
      setError(null);
    }, 3000);
  }
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed top-2 rounded-3xl border-4 border-red-600 bg-red-200 p-8 text-center shadow-xl"
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.15 }}
        >
          <p>{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Error;

//BUG not fully centered when you have scrollbar on pc
