'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Search } from 'lucide-react';
import { getAdminUsers } from '@/entities/user/api/user.api';
import { AuthGate } from '@/widgets/auth-gate';

export default function AdminCustomersPage() {
  return (
    <AuthGate requiredRole="ADMIN">
      <AdminCustomersContent />
    </AuthGate>
  );
}

function AdminCustomersContent() {
  const [searchValue, setSearchValue] = useState('');

  const usersQuery = useQuery({
    queryKey: ['admin-customers', 200],
    queryFn: () => getAdminUsers(200),
  });

  const customers = useMemo(
    () =>
      (usersQuery.data ?? []).filter((user) => user.role === 'CUSTOMER'),
    [usersQuery.data],
  );

  const filteredCustomers = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    if (!normalized) {
      return customers;
    }

    return customers.filter((customer) => {
      const email = customer.email.toLowerCase();
      const shortId = customer.id.slice(0, 8).toLowerCase();
      const fullId = customer.id.toLowerCase();

      return (
        email.includes(normalized) ||
        shortId.includes(normalized) ||
        fullId.includes(normalized)
      );
    });
  }, [customers, searchValue]);

  return (
    <div className="space-y-6 text-[#1E1E1E]">
      <div className="flex flex-col gap-2">
        <h2 className="text-[28px] font-black tracking-tight">Клієнти</h2>
        <p className="text-sm text-gray-600">
          Список зареєстрованих клієнтів з пошуком по email та ID.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Всього користувачів</p>
          <p className="mt-2 text-2xl font-black">{usersQuery.data?.length ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Клієнтів</p>
          <p className="mt-2 text-2xl font-black">{customers.length}</p>
        </article>
        <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Знайдено</p>
          <p className="mt-2 text-2xl font-black">{filteredCustomers.length}</p>
        </article>
      </section>

      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Пошук клієнта за email або ID..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        {usersQuery.isPending && (
          <p className="text-sm text-gray-500">Завантаження списку клієнтів...</p>
        )}

        {usersQuery.isError && (
          <p className="text-sm text-red-600">{usersQuery.error.message}</p>
        )}

        {usersQuery.data && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Клієнт</th>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Реєстрація</th>
                  <th className="px-4 py-3 font-medium">Оновлено</th>
                  <th className="px-4 py-3 font-medium text-right">Контакт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#111]">{customer.email}</p>
                      <p className="text-xs text-gray-500">CUSTOMER</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {customer.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(customer.createdAt).toLocaleString('uk-UA')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(customer.updatedAt).toLocaleString('uk-UA')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`mailto:${customer.email}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {usersQuery.data && !filteredCustomers.length && (
          <p className="text-sm text-gray-500">
            Клієнтів за вашим запитом не знайдено.
          </p>
        )}
      </section>
    </div>
  );
}
