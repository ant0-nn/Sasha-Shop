'use client';

import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { defaultShopSettings } from '@/entities/shop-settings/model/defaults';
import { ShopSettings } from '@/entities/shop-settings/model/types';
import {
  useAdminUpdateShopSettingsMutation,
  useShopSettingsQuery,
} from '@/features/shop-settings/model/use-shop-settings';

export default function AdminSettingsPage() {
  const settingsQuery = useShopSettingsQuery(true);
  const updateSettingsMutation = useAdminUpdateShopSettingsMutation();
  const [draftForm, setDraftForm] = useState<ShopSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const form = draftForm ?? settingsQuery.data ?? defaultShopSettings;

  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.supportEmail.trim()),
    [form.supportEmail],
  );

  const canSave =
    form.storeName.trim().length >= 2 &&
    form.supportPhone.trim().length >= 8 &&
    form.seoDescription.trim().length > 0 &&
    form.orderPrefix.trim().length >= 1 &&
    isEmailValid;

  const setField = <K extends keyof ShopSettings>(
    key: K,
    value: ShopSettings[K],
  ) => {
    setDraftForm((prev) => ({ ...(prev ?? form), [key]: value }));
    setSavedMessage('');
    setErrorMessage('');
  };

  const handleReset = () => {
    setDraftForm(null);
    setSavedMessage('');
    setErrorMessage('');
  };

  const handleSave = async () => {
    if (!canSave) {
      setErrorMessage('Перевірте заповнення полів перед збереженням.');
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        ...form,
        orderPrefix: form.orderPrefix.trim().toUpperCase(),
      });
      setDraftForm(null);
      setSavedMessage('Налаштування збережено.');
      setErrorMessage('');
    } catch (error) {
      setSavedMessage('');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не вдалося зберегти налаштування.',
      );
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-[28px] font-black tracking-tight text-[#1E1E1E]">
          Налаштування магазину
        </h2>
        <p className="text-sm text-gray-600">
          Керуйте базовими параметрами платформи.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {settingsQuery.isPending ? (
          <p className="mb-4 text-sm text-gray-500">
            Завантаження налаштувань...
          </p>
        ) : null}
        {settingsQuery.isError ? (
          <p className="mb-4 text-sm font-semibold text-red-600">
            {settingsQuery.error.message}
          </p>
        ) : null}
        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSave();
          }}
        >
          <section className="space-y-4">
            <h3 className="border-b border-gray-200 pb-2 text-lg font-bold text-[#1E1E1E]">
              Загальна інформація
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Назва магазину
                </span>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(event) => setField('storeName', event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Email підтримки
                </span>
                <input
                  type="email"
                  value={form.supportEmail}
                  onChange={(event) => setField('supportEmail', event.target.value)}
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:ring-2 ${
                    isEmailValid
                      ? 'border-gray-200 focus:border-[#4CE2D1] focus:ring-[#4CE2D1]/30'
                      : 'border-red-300 focus:border-red-400 focus:ring-red-200'
                  }`}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Телефон підтримки
                </span>
                <input
                  type="text"
                  value={form.supportPhone}
                  onChange={(event) => setField('supportPhone', event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Telegram менеджера
                </span>
                <input
                  type="text"
                  value={form.managerTelegram}
                  onChange={(event) =>
                    setField('managerTelegram', event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Опис магазину (SEO)
              </span>
              <textarea
                rows={4}
                value={form.seoDescription}
                onChange={(event) => setField('seoDescription', event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
              />
            </label>
          </section>

          <section className="space-y-4">
            <h3 className="border-b border-gray-200 pb-2 text-lg font-bold text-[#1E1E1E]">
              Локалізація та замовлення
            </h3>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Валюта за замовчуванням
                </span>
                <select
                  value={form.currency}
                  onChange={(event) =>
                    setField('currency', event.target.value as ShopSettings['currency'])
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
                >
                  <option value="UAH">UAH (Гривня)</option>
                  <option value="USD">USD (Долар)</option>
                  <option value="EUR">EUR (Євро)</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Часовий пояс
                </span>
                <select
                  value={form.timezone}
                  onChange={(event) => setField('timezone', event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
                >
                  <option value="Europe/Kyiv">Europe/Kyiv</option>
                  <option value="Europe/Warsaw">Europe/Warsaw</option>
                  <option value="UTC">UTC</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">
                  Префікс номера замовлення
                </span>
                <input
                  type="text"
                  maxLength={5}
                  value={form.orderPrefix}
                  onChange={(event) => setField('orderPrefix', event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm uppercase text-[#1E1E1E] outline-none transition-all focus:border-[#4CE2D1] focus:ring-2 focus:ring-[#4CE2D1]/30"
                />
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-6">
            <div>
              {savedMessage ? (
                <p className="text-sm font-semibold text-emerald-700">
                  {savedMessage}
                </p>
              ) : null}
              {errorMessage ? (
                <p className="text-sm font-semibold text-red-600">
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={updateSettingsMutation.isPending}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={!canSave || updateSettingsMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4CE2D1] px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-[#37c9ba] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {updateSettingsMutation.isPending
                  ? 'Збереження...'
                  : 'Зберегти зміни'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
