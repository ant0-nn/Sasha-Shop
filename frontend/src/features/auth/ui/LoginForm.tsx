'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginMutation, useRegisterMutation } from '../model/use-auth';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const mutation = mode === 'login' ? loginMutation : registerMutation;
  const errorText = useMemo(() => mutation.error?.message ?? null, [mutation.error]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = await mutation.mutateAsync({
      email,
      password,
    });

    const nextPath = searchParams.get('next');
    if (nextPath) {
      router.push(nextPath);
      return;
    }

    router.push(payload.user.role === 'ADMIN' ? '/dashboard' : '/account');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-foreground p-6 shadow-sm">
      <div className="flex gap-2 rounded-xl bg-background p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-primary text-primary-content' : 'text-copy-light'}`}
        >
          Вхід
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-primary text-primary-content' : 'text-copy-light'}`}
        >
          Реєстрація
        </button>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-copy">Email</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none ring-primary/30 focus:ring"
          placeholder="you@example.com"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-copy">Пароль</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 outline-none ring-primary/30 focus:ring"
          placeholder="Мінімум 8 символів"
        />
      </label>

      {errorText && <p className="text-sm text-error">{errorText}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-content transition hover:bg-primary-dark disabled:opacity-60"
      >
        {mutation.isPending ? 'Зачекайте...' : mode === 'login' ? 'Увійти' : 'Створити акаунт'}
      </button>
    </form>
  );
}
