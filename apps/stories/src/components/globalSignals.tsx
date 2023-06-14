import { createSignal, createContext, useContext } from "solid-js";

const BarCounterContext = createContext();
const PieCounterContext = createContext();
const DataContext = createContext();

export const DataProvider = (props) => {
  const [data, setData] = createSignal(props.data);
  const [dataA, setDataA] = createSignal(props.dataA);
  const [dataB, setDataB] = createSignal(props.dataB);

  return (
    <DataContext.Provider
      value={{ data, dataA, dataB, setData, setDataA, setDataB }}
    >
      {props.children}
    </DataContext.Provider>
  );
};

export const BarCounterProvider = (props) => {
  const [barChartCount, setBarChartCount] = createSignal(props.count || 0);

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
export const useData = () => {
  return useContext(DataContext);
};
