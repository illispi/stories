import { type Component } from 'solid-js';
import { handleEden } from '~/utils';
import { createQuery } from '@tanstack/solid-query';
import { app } from '~/app';

const test: Component<{}> = (props) => {
  const testQuery = createQuery(() => ({
    queryKey: ['test'],
    queryFn: async () => handleEden(await app.api.test.get()),
  }));

  return <div>{testQuery.data?.articles}</div>;
};

export default test;
