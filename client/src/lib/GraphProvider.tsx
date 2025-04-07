import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import { graphClient } from './graph';

// React provider component for Apollo Client
export function GraphProvider({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={graphClient.getClient()}>
      {children}
    </ApolloProvider>
  );
}