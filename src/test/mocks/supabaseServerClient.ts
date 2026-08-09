export interface MockAuthResult {
  data: {
    user: { id: string; email?: string } | null;
  };
  error: unknown;
}

export interface MockQueryResult {
  data: unknown;
  error: unknown;
}

export interface MockSupabaseServerClientOptions {
  user?: { id: string; email?: string } | null;
  authError?: unknown;
  from?: (table: string) => unknown;
}

export interface MockChainableQuery {
  select: (cols: string) => MockChainableQuery;
  eq: (col: string, val: string) => MockChainableQuery;
  maybeSingle: () => MockQueryResult;
}

export type MockFrom = (table: string) => MockChainableQuery;

export function createClientMockResult(options?: MockSupabaseServerClientOptions) {
  const from = options?.from ?? defaultFromMock;
  return {
    auth: {
      getUser: () => ({
        data: { user: options?.user ?? null },
        error: options?.authError ?? null,
      }),
    },
    from,
  };
}

export function defaultFromMock(table: string): MockChainableQuery {
  void table;
  const chain: MockChainableQuery = {
    select: (cols: string) => {
      void cols;
      return chain;
    },
    eq: (col: string, val: string) => {
      void col;
      void val;
      return chain;
    },
    maybeSingle: () => ({ data: null, error: null }),
  };
  return chain;
}

export function createMockSupabaseServerClient(overrides?: {
  user?: { id: string; email?: string } | null;
  authError?: unknown;
  from?: (table: string) => unknown;
}) {
  return createClientMockResult(overrides);
}
