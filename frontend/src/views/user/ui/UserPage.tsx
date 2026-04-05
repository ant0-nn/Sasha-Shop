'use client';

import { AuthGate } from '@/widgets/auth-gate';
import { useMeQuery } from '@/features/auth/model/use-auth';

export function UserPage() {
  return (
    <AuthGate>
      <UserContent />
    </AuthGate>
  );
}

function UserContent() {
  const meQuery = useMeQuery(true);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-primary-content">Сторінка користувача</h1>
      <p className="mt-2 text-copy-light">Тут можна розширювати персональні налаштування та історію замовлень.</p>

      <div className="mt-6 rounded-2xl border border-border bg-foreground p-6">
        {meQuery.isPending && <p>Завантаження...</p>}
        {meQuery.isError && <p className="text-error">{meQuery.error.message}</p>}
        {meQuery.data && (
          <ul className="space-y-2 text-sm">
            <li><strong>Email:</strong> {meQuery.data.email}</li>
            <li><strong>Роль:</strong> {meQuery.data.role}</li>
            <li><strong>Оновлено:</strong> {new Date(meQuery.data.updatedAt).toLocaleString('uk-UA')}</li>
          </ul>
        )}
      </div>
    </div>
  );
}
