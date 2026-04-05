'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthGate } from '@/widgets/auth-gate';
import { getAdminStats, getAdminUsers, setUserRole } from '@/entities/user/api/user.api';

export function AdminDashboardPage() {
  return (
    <AuthGate requiredRole="ADMIN">
      <AdminDashboardContent />
    </AuthGate>
  );
}

function AdminDashboardContent() {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers(30),
  });

  const setRoleMutation = useMutation({
    mutationFn: setUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  return (
    <div className="space-y-6 text-[#1E1E1E]">
      <h2 className="text-[28px] font-black tracking-tight">Адмін-панель</h2>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Користувачі" value={statsQuery.data?.usersCount ?? '-'} />
        <StatCard title="Адміни" value={statsQuery.data?.adminsCount ?? '-'} />
        <StatCard title="Замовлення" value={statsQuery.data?.ordersCount ?? '-'} />
        <StatCard title="Дохід" value={statsQuery.data?.totalRevenue ?? '-'} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Користувачі</h3>

        {usersQuery.isPending && <p className="text-sm text-gray-500">Завантаження списку...</p>}
        {usersQuery.isError && <p className="text-sm text-red-500">{usersQuery.error.message}</p>}

        {usersQuery.data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Роль</th>
                  <th className="px-3 py-2">Реєстрація</th>
                  <th className="px-3 py-2 text-right">Дії</th>
                </tr>
              </thead>
              <tbody>
                {usersQuery.data.map((user) => {
                  const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';

                  return (
                    <tr key={user.id} className="border-b last:border-b-0">
                      <td className="px-3 py-3">{user.email}</td>
                      <td className="px-3 py-3">{user.role}</td>
                      <td className="px-3 py-3">{new Date(user.createdAt).toLocaleDateString('uk-UA')}</td>
                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => setRoleMutation.mutate({ userId: user.id, role: nextRole })}
                          className="rounded-lg bg-[#4CE2D1] px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
                          disabled={setRoleMutation.isPending}
                        >
                          Зробити {nextRole}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </article>
  );
}
