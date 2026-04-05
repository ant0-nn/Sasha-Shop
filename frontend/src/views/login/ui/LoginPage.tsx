import { LoginForm } from '@/features/auth/ui/LoginForm';
import { Suspense } from 'react';

export function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-5xl place-items-center px-4 py-8">
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <section className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 text-primary-content">
          <p className="text-xs uppercase tracking-[0.2em]">SashaShop Account</p>
          <h1 className="mt-3 text-3xl font-black">Керуйте замовленнями та доступом з одного кабінету</h1>
          <p className="mt-4 text-sm opacity-80">
            Після входу ви отримуєте персональну сторінку користувача. Для ролі ADMIN автоматично відкриється адмін-панель.
          </p>
        </section>

        <section>
          <Suspense fallback={<div className="rounded-2xl border border-border bg-foreground p-6">Завантаження форми...</div>}>
            <LoginForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
