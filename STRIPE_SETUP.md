# Configuración de Stripe - Guía de Setup

## 1. Instalar Stripe
```bash
npm install stripe
```

## 2. Variables de Entorno (.env.local)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cómo obtenerlas:
1. Ve a https://dashboard.stripe.com/
2. Inicia sesión
3. Ve a **Developers** > **API Keys**
4. Copia **Publishable key** y **Secret key**

## 3. Configurar Webhook
1. En Stripe Dashboard: **Developers** > **Webhooks**
2. Click en **Add an endpoint**
3. URL: `https://tudominio.com/api/webhooks/stripe`
4. Selecciona eventos:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copia el **Signing secret** a `.env.local` como `STRIPE_WEBHOOK_SECRET`

## 4. Crear Tablas en Supabase

**Opción A - Usando Supabase CLI:**
```bash
supabase migration up
```

**Opción B - Manualmente:**
Ve a Supabase Dashboard > SQL Editor y ejecuta el SQL en:
`supabase/migrations/0005_stripe_setup.sql`

## 5. Usar en tu App

### Checkout (Pago único):
```typescript
'use client';
import { createCheckoutSession } from '@/lib/stripe';

export function BuyButton({ priceId }: { priceId: string }) {
  const handleClick = async () => {
    const session = await createCheckoutSession({
      priceId,
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.origin + '/cancel',
      email: userEmail,
      metadata: { orderId: '123' },
    });
    window.location.href = session.url!;
  };

  return <button onClick={handleClick}>Comprar</button>;
}
```

### Suscripción:
```typescript
const session = await createSubscriptionSession({
  priceId: 'price_xxx',
  successUrl: window.location.origin + '/success',
  cancelUrl: window.location.origin + '/cancel',
  trialDays: 7,
});
```

## 6. Probar en Local

Usar **Stripe CLI** para simular webhooks:

```bash
# Instalar Stripe CLI
# En Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Simular evento
stripe trigger checkout.session.completed
```

## Estructura Creada
```
src/
├── app/
│   └── api/
│       └── webhooks/
│           └── stripe/
│               └── route.ts         ← Webhook handler
└── lib/
    └── stripe.ts                    ← Utilidades
supabase/
└── migrations/
    └── 0005_stripe_setup.sql        ← Tablas BD
```

## ¿Qué sucede ahora?

1. **Usuario paga** → Stripe crea sesión de checkout
2. **Pago completado** → Stripe envía webhook
3. **Tu servidor recibe** → `POST /api/webhooks/stripe`
4. **Se verifica firma** → Garantiza que viene de Stripe
5. **Se actualiza BD** → Marca pago como completado
6. **Tú puedes:**
   - ✅ Crear orden
   - ✅ Activar acceso
   - ✅ Enviar email
   - ✅ Activar suscripción

## Eventos Manejados
- `checkout.session.completed` → Pago exitoso
- `payment_intent.payment_failed` → Pago rechazado
- `charge.refunded` → Reembolso procesado
- `customer.subscription.created` → Nueva suscripción
- `customer.subscription.updated` → Actualización
- `customer.subscription.deleted` → Cancelada

## Próximos Pasos
1. Obtén API keys de Stripe
2. Configura webhook URL
3. Ejecuta migraciones en Supabase
4. Añade componentes de pago
5. Prueba con Stripe CLI
6. Go live cuando esté listo
