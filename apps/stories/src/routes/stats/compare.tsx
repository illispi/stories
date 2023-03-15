import { ErrorBoundary, Match, Suspense, Switch } from "solid-js";

const CompareStats = () => {
  return (
    <ErrorBoundary fallback={(err) => err}>
      <Suspense fallback={<div>Loading</div>}>
        <Switch>
          <Match></Match>
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CompareStats;
