import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject, ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';

// Define the Graph client class for our application
class GraphClient {
  private client: ApolloClient<NormalizedCacheObject>;
  private static instance: GraphClient;

  // Private constructor to enforce singleton pattern
  private constructor() {
    // Create an HTTP link to The Graph's API
    const httpLink = new HttpLink({
      // Default to a placeholder URL - will be replaced with actual subgraph
      uri: import.meta.env.VITE_GRAPH_API_URL || 'https://api.thegraph.com/subgraphs/name/placeholder/web3-reddit',
    });

    // Initialize Apollo Client with proper caching configuration
    this.client = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              posts: {
                // Merge function for paginated posts
                keyArgs: ["where", "orderBy", "orderDirection"],
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
              communities: {
                // Merge function for paginated communities
                keyArgs: ["where", "orderBy", "orderDirection"],
                merge(existing = [], incoming) {
                  return [...existing, ...incoming];
                },
              },
            },
          },
        },
      }),
      defaultOptions: {
        query: {
          fetchPolicy: 'cache-first', // Use cache-first to improve performance
        },
        watchQuery: {
          fetchPolicy: 'cache-and-network', // Use cache and network for real-time updates
          nextFetchPolicy: 'cache-first',
        },
      },
    });
  }

  // Get singleton instance
  public static getInstance(): GraphClient {
    if (!GraphClient.instance) {
      GraphClient.instance = new GraphClient();
    }
    return GraphClient.instance;
  }

  // Get Apollo client instance
  public getClient(): ApolloClient<NormalizedCacheObject> {
    return this.client;
  }

  // Update the API endpoint (useful for switching environments)
  public updateEndpoint(uri: string): void {
    // Create a new HTTP link with the updated URI
    const httpLink = new HttpLink({
      uri,
    });

    // Update the Apollo Client with the new link
    this.client.setLink(httpLink);
  }
}

// Export singleton instance
export const graphClient = GraphClient.getInstance();

// Separate jsx file is needed for the provider
// This file is just for the client setup

// Export Apollo Client instance for direct usage
export const apolloClient = graphClient.getClient();