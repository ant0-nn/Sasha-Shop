'use client';

import { FormEvent, useState } from 'react';
import { uploadBannerImage } from '@/entities/banner/api/admin-banners.api';
import { useCreateBannerMutation } from '../model/use-admin-banners';

export function CreateBannerForm() {
  const createMutation = useCreateBannerMutation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!imageFile) {
      setLocalError('Оберіть файл зображення');
      return;
    }

    try {
      setLocalError(null);
      setIsUploading(true);
      const { imageUrl } = await uploadBannerImage(imageFile);

      await createMutation.mutateAsync({
        title,
        description: description || undefined,
        imageUrl,
        linkUrl: linkUrl || undefined,
        isActive,
      });

      setTitle('');
      setDescription('');
      setImageFile(null);
      setLinkUrl('');
      setIsActive(true);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-2">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Заголовок"
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        required
      />
      <label className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
        <span className="mb-2 block text-xs text-gray-500">Зображення (JPG/PNG/WEBP, до 20MB)</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          className="w-full text-sm"
          required
        />
      </label>
      <input
        value={linkUrl}
        onChange={(event) => setLinkUrl(event.target.value)}
        placeholder="Link URL (optional)"
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Активний банер
      </label>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Опис (optional)"
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm md:col-span-2"
        rows={3}
      />

      {localError && (
        <p className="text-sm text-red-500 md:col-span-2">{localError}</p>
      )}

      {createMutation.isError && (
        <p className="text-sm text-red-500 md:col-span-2">{createMutation.error.message}</p>
      )}

      <button
        type="submit"
        disabled={createMutation.isPending || isUploading}
        className="rounded-xl bg-[#4CE2D1] px-4 py-2 text-sm font-bold text-black transition hover:brightness-95 disabled:opacity-50 md:col-span-2"
      >
        {createMutation.isPending || isUploading ? 'Завантаження...' : 'Створити банер'}
      </button>
    </form>
  );
}
