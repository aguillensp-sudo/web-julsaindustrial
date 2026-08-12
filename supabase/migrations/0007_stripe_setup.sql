-- Tabla para transacciones de Stripe
CREATE TABLE IF NOT EXISTS stripe_transactions (
  id BIGSERIAL PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  amount BIGINT,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  email TEXT,
  error_message TEXT,
  metadata JSONB,
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para suscripciones
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancelled_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON stripe_transactions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON stripe_transactions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON stripe_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON stripe_subscriptions(status);

-- RLS: estas tablas solo las escribe el webhook con la service role key.
-- Sin políticas para anon/authenticated, quedan bloqueadas para el cliente.
ALTER TABLE stripe_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
