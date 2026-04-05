'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { uploadBannerImage } from '@/entities/banner/api/admin-banners.api';
import { CreateBannerForm } from '@/features/banner/ui/CreateBannerForm';
import {
  useAdminBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from '@/features/banner/model/use-admin-banners';

export function AdminBannersPage() {
  const bannersQuery = useAdminBannersQuery();
  const updateMutation = useUpdateBannerMutation();
  const deleteMutation = useDeleteBannerMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const editingBanner = useMemo(
    () => bannersQuery.data?.find((banner) => banner.id === editingId) ?? null,
    [bannersQuery.data, editingId],
  );

  const startEdit = (id: string) => {
    const banner = bannersQuery.data?.find((item) => item.id === id);
    if (!banner) return;

    setEditingId(banner.id);
    setTitle(banner.title);
    setDescription(banner.description || '');
    setLinkUrl(banner.linkUrl || '');
    setIsActive(banner.isActive);
    setNewImage(null);
    setLocalError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLocalError(null);
    setNewImage(null);
  };

  const submitEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId || !editingBanner) return;

    try {
      setLocalError(null);

      let imageUrl = editingBanner.imageUrl;
      if (newImage) {
        const uploaded = await uploadBannerImage(newImage);
        imageUrl = uploaded.imageUrl;
      }

      await updateMutation.mutateAsync({
        id: editingId,
        title,
        description: description || undefined,
        linkUrl: linkUrl || undefined,
        isActive,
        imageUrl,
      });

      cancelEdit();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary-content">Управління Банерами</h2>
        <p className="text-sm text-copy-light">Створюйте, редагуйте та видаляйте банери для головної сторінки.</p>
      </div>

      <CreateBannerForm />

      <div className="overflow-hidden rounded-2xl border border-border bg-white/5 shadow-inner backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-white/5 uppercase text-copy-lighter">
            <tr>
              <th className="px-6 py-4 font-medium">Зображення</th>
              <th className="px-6 py-4 font-medium">Заголовок</th>
              <th className="px-6 py-4 font-medium">Статус</th>
              <th className="px-6 py-4 font-medium text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bannersQuery.isPending && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-copy-light">
                  Завантаження банерів...
                </td>
              </tr>
            )}

            {bannersQuery.isError && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-red-400">
                  {bannersQuery.error.message}
                </td>
              </tr>
            )}

            {bannersQuery.data?.map((banner) => (
              <tr key={banner.id} className="transition-colors hover:bg-white/5">
                <td className="px-6 py-4">
                  <div className="relative h-16 w-32 overflow-hidden rounded-lg border border-white/10">
                    <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-primary-content">{banner.title}</div>
                  <div className="mt-1 max-w-xs truncate text-xs text-copy-light">{banner.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      banner.isActive
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-red-500/20 bg-red-500/10 text-red-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${banner.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                    />
                    {banner.isActive ? 'Активний' : 'Вимкнений'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(banner.id)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm('Видалити цей банер?')) return;
                        deleteMutation.mutate(banner.id);
                      }}
                      className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-600"
                      disabled={deleteMutation.isPending}
                    >
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {bannersQuery.data?.length === 0 && !bannersQuery.isPending && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-copy-light">
                  Банери не знайдено. Додайте свій перший банер.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingBanner && (
        <form
          onSubmit={submitEdit}
          className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2"
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Заголовок"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
            required
          />
          <input
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            placeholder="Link URL"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
          />
          <label className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2">
            <span className="mb-2 block text-xs text-gray-500">Нове зображення (опціонально)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setNewImage(event.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Опис"
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
            rows={3}
          />
          <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Активний банер
          </label>

          {localError && <p className="text-sm text-red-500 md:col-span-2">{localError}</p>}
          {updateMutation.isError && (
            <p className="text-sm text-red-500 md:col-span-2">{updateMutation.error.message}</p>
          )}

          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-[#4CE2D1] px-4 py-2 text-sm font-bold text-black"
            >
              {updateMutation.isPending ? 'Збереження...' : 'Зберегти'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
