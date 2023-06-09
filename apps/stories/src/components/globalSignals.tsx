import { createSignal, createContext, useContext } from "solid-js";

const BarCounterContext = createContext();
const PieCounterContext = createContext();

export const BarCounterProvider = (props) => {
  const [barChartCount, setBarChartCount] = createSignal(props.count || 1);
  console.log("espigfjnsaeopijes");

  const barCounter = [
    barChartCount,
    {
      increment() {
        setBarChartCount((c) => c + 1);
      },
    },
  ];

  return (
    <BarCounterContext.Provider value={barCounter}>
      {props.children}
    </BarCounterContext.Provider>
  );
};
export const PieCounterProvider = (props) => {
  const [pieChartCount, setPieChartCount] = createSignal(props.count || 0);

  const pieCounter = [
    pieChartCount,
    {
      increment() {
        setPieChartCount((c) => c + 1);
      },
    },
  ];

  return (
    <PieCounterContext.Provider value={pieCounter}>
      {props.children}
    </PieCounterContext.Provider>
  );
};

export const usePieCounter = () => {
  return useContext(PieCounterContext);
};
export const useBarCounter = () => {
  return useContext(BarCounterContext);
};
