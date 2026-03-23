import { HttpLink, ApolloLink, Observable } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { ApolloClient, InMemoryCache } from '@apollo/experimental-nextjs-app-support';
import { print } from 'graphql';
import { REFRESH_TOKEN_MUTATION } from '../graphql/mutations/auth.mutations';

const authLink = new ApolloLink((operation, forward) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('momentee_access_token');
    if (token) {
      operation.setContext({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    }
  }
  return forward(operation);
});

// Token refresh state — shared across concurrent requests
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

function resolvePendingRequests() {
  pendingRequests.forEach((cb) => cb());
  pendingRequests = [];
}

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (typeof window === 'undefined') return;

  const isUnauthenticated = graphQLErrors?.some(
    (e) => e.extensions?.code === 'UNAUTHENTICATED',
  );

  if (!isUnauthenticated) return;

  // Don't try to refresh if the failing operation IS the refresh
  if (operation.operationName === 'RefreshToken') return;

  if (!isRefreshing) {
    isRefreshing = true;
    const refreshToken = localStorage.getItem('momentee_refresh_token');

    if (!refreshToken) {
      // No refresh token — force logout
      localStorage.removeItem('momentee_access_token');
      localStorage.removeItem('momentee_refresh_token');
      window.location.href = '/login';
      return;
    }

    const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

    fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: print(REFRESH_TOKEN_MUTATION),
        variables: { token: refreshToken },
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const data = result?.data?.refreshToken;
        if (data?.accessToken) {
          localStorage.setItem('momentee_access_token', data.accessToken);
          localStorage.setItem('momentee_refresh_token', data.refreshToken);
          // Update the current operation's headers
          operation.setContext({
            headers: {
              authorization: `Bearer ${data.accessToken}`,
            },
          });
          resolvePendingRequests();
        } else {
          // Refresh failed — force logout
          localStorage.removeItem('momentee_access_token');
          localStorage.removeItem('momentee_refresh_token');
          window.location.href = '/login';
        }
      })
      .catch(() => {
        localStorage.removeItem('momentee_access_token');
        localStorage.removeItem('momentee_refresh_token');
        window.location.href = '/login';
      })
      .finally(() => {
        isRefreshing = false;
      });
  }

  // Queue this failed request to retry after refresh completes
  return new Observable((observer) => {
    pendingRequests.push(() => {
      // Re-read the new token for the retry
      const newToken = localStorage.getItem('momentee_access_token');
      if (newToken) {
        operation.setContext({
          headers: {
            authorization: `Bearer ${newToken}`,
          },
        });
      }
      forward(operation).subscribe(observer);
    });
  });
});

function makeClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    fetchOptions: { cache: 'no-store' },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, authLink, httpLink]),
  });
}

export { makeClient };
