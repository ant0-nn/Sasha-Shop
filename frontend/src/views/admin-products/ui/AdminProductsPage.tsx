'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { uploadProductImage } from '@/entities/product/api/admin-products.api';
import {
  AvailabilityStatus,
  AdminProduct,
  CreateProductPayload,
  ProductKind,
  UpdateProductPayload,
} from '@/entities/product/model/types';
import {
  useAdminProductsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from '@/features/product/model/use-admin-products';

const PRODUCT_TYPES: ProductKind[] = ['OIL', 'ADDITIVE', 'FILTER', 'OTHER'];

const PRODUCT_TYPE_LABELS: Record<ProductKind, string> = {
  OIL: 'Олива',
  ADDITIVE: 'Присадка',
  FILTER: 'Фільтр',
  OTHER: 'Інше',
};

const AVAILABILITY_OPTIONS: Array<{
  value: AvailabilityStatus;
  label: string;
}> = [
  { value: 'IN_STOCK', label: 'Є в наявності' },
  { value: 'OUT_OF_STOCK', label: 'Немає в наявності' },
  { value: 'EXPECTED', label: 'Очікується' },
];

const VISCOSITY_OPTIONS = [
  '',
  '0W-20',
  '0W-30',
  '0W-40',
  '5W-30',
  '5W-40',
  '10W-40',
  '15W-40',
];

const DEFAULT_VARIANT_VOLUMES = ['1', '4', '5'];

type ProductFormState = {
  name: string;
  slug: string;
  variantGroup: string;
  volumeLiters: string;
  description: string;
  imageUrl: string;
  price: string;
  availabilityStatus: AvailabilityStatus;
  sku: string;
  productType: ProductKind;
  categorySlug: string;
  categoryName: string;
  brandName: string;
  viscosityName: string;
  oilTypeName: string;
  isActive: boolean;
  isNew: boolean;
  isPopular: boolean;
};

const EMPTY_FORM: ProductFormState = {
  name: '',
  slug: '',
  variantGroup: '',
  volumeLiters: '',
  description: '',
  imageUrl: '',
  price: '',
  availabilityStatus: 'IN_STOCK',
  sku: '',
  productType: 'OTHER',
  categorySlug: '',
  categoryName: '',
  brandName: '',
  viscosityName: '',
  oilTypeName: '',
  isActive: true,
  isNew: false,
  isPopular: false,
};

const formatPrice = (price: string) => {
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) {
    return `₴${price}`;
  }

  return `₴${numeric.toLocaleString('uk-UA')}`;
};

const availabilityBadge = (status: AvailabilityStatus) => {
  if (status === 'OUT_OF_STOCK') {
    return 'border-red-500/20 bg-red-500/10 text-red-400';
  }

  if (status === 'EXPECTED') {
    return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
  }

  return 'border-green-500/20 bg-green-500/10 text-green-400';
};

const availabilityLabel = (status: AvailabilityStatus) => {
  if (status === 'OUT_OF_STOCK') return 'Немає в наявності';
  if (status === 'EXPECTED') return 'Очікується';
  return 'Є в наявності';
};

function productToForm(product: AdminProduct): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    variantGroup: product.variantGroup || '',
    volumeLiters:
      product.volumeLiters !== null && product.volumeLiters !== undefined
        ? String(product.volumeLiters)
        : '',
    description: product.description,
    imageUrl: product.imageUrl || '',
    price: product.price,
    availabilityStatus: product.availabilityStatus,
    sku: product.sku,
    productType: product.productType,
    categorySlug: product.categorySlug,
    categoryName: product.categoryName,
    brandName: product.brandName || '',
    viscosityName: product.viscosityName || '',
    oilTypeName: product.oilTypeName || '',
    isActive: product.isActive,
    isNew: product.isNew,
    isPopular: product.isPopular,
  };
}

function toCreatePayload(form: ProductFormState): CreateProductPayload {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    variantGroup: form.variantGroup.trim() || undefined,
    volumeLiters: form.volumeLiters.trim() ? Number(form.volumeLiters) : undefined,
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim() || undefined,
    price: Number(form.price),
    availabilityStatus: form.availabilityStatus,
    sku: form.sku.trim(),
    productType: form.productType,
    categorySlug: form.categorySlug.trim(),
    categoryName: form.categoryName.trim(),
    brandName: form.brandName.trim() || undefined,
    viscosityName: form.viscosityName.trim() || undefined,
    oilTypeName: form.oilTypeName.trim() || undefined,
    isActive: form.isActive,
    isNew: form.isNew,
    isPopular: form.isPopular,
  };
}

function toUpdatePayload(id: string, form: ProductFormState): UpdateProductPayload {
  return {
    id,
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    variantGroup: form.variantGroup.trim() || undefined,
    volumeLiters: form.volumeLiters.trim() ? Number(form.volumeLiters) : undefined,
    description: form.description.trim(),
    imageUrl: form.imageUrl.trim() || undefined,
    price: Number(form.price),
    availabilityStatus: form.availabilityStatus,
    sku: form.sku.trim(),
    productType: form.productType,
    categorySlug: form.categorySlug.trim(),
    categoryName: form.categoryName.trim(),
    brandName: form.brandName.trim(),
    viscosityName: form.viscosityName.trim(),
    oilTypeName: form.oilTypeName.trim(),
    isActive: form.isActive,
    isNew: form.isNew,
    isPopular: form.isPopular,
  };
}

function normalizeBaseName(name: string): string {
  return name.replace(/\s+\d+(?:[.,]\d+)?\s*л$/i, '').trim();
}

function normalizeBaseSku(sku: string): string {
  return sku.replace(/[-_\s]?\d+(?:[.,]\d+)?l$/i, '').trim();
}

function formatVolumeLabel(volume: string): string {
  return `${volume.replace(',', '.')}л`;
}

function toVariantGroupSeed(form: ProductFormState): string {
  const base = normalizeBaseName(form.name.trim()) || form.name.trim();
  const brandPrefix = form.brandName.trim();
  return `${brandPrefix ? `${brandPrefix} ` : ''}${base}`
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminProductsPage() {
  const productsQuery = useAdminProductsQuery();
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();
  const deleteMutation = useDeleteProductMutation();

  const [search, setSearch] = useState('');
  const [createForm, setCreateForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState>(EMPTY_FORM);
  const [localError, setLocalError] = useState<string | null>(null);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [createVolumeVariants, setCreateVolumeVariants] = useState(false);
  const [selectedVariantVolumes, setSelectedVariantVolumes] = useState<string[]>(DEFAULT_VARIANT_VOLUMES);

  const filteredProducts = useMemo(() => {
    const products = productsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const combined = `${product.name} ${product.sku} ${product.brandName || ''}`.toLowerCase();
      return combined.includes(term);
    });
  }, [productsQuery.data, search]);

  const onCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLocalError(null);
      const payload = toCreatePayload(createForm);

      let uploadedImageUrl: string | undefined;
      if (createImageFile) {
        const uploaded = await uploadProductImage(createImageFile);
        uploadedImageUrl = uploaded.imageUrl;
      }

      if (!createVolumeVariants) {
        if (uploadedImageUrl) {
          payload.imageUrl = uploadedImageUrl;
        }

        await createMutation.mutateAsync(payload);
      } else {
        if (!selectedVariantVolumes.length) {
          throw new Error('Оберіть мінімум один обʼєм для варіантів');
        }

        const baseName = normalizeBaseName(createForm.name.trim());
        const baseSku = normalizeBaseSku(createForm.sku.trim());
        const variantGroup = createForm.variantGroup.trim() || toVariantGroupSeed(createForm);

        for (const volume of selectedVariantVolumes) {
          const volumeLabel = formatVolumeLabel(volume);
          const variantPayload: CreateProductPayload = {
            ...payload,
            name: `${baseName} ${volumeLabel}`,
            slug: undefined,
            variantGroup,
            volumeLiters: Number(volume.replace(',', '.')),
            sku: `${baseSku}-${volume.replace(',', '_')}L`,
            imageUrl: uploadedImageUrl ?? payload.imageUrl,
          };

          await createMutation.mutateAsync(variantPayload);
        }
      }

      setCreateForm(EMPTY_FORM);
      setCreateImageFile(null);
      setCreateVolumeVariants(false);
      setSelectedVariantVolumes(DEFAULT_VARIANT_VOLUMES);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Не вдалося створити товар');
    }
  };

  const startEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setEditForm(productToForm(product));
    setEditImageFile(null);
    setLocalError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditImageFile(null);
    setLocalError(null);
  };

  const onEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    try {
      setLocalError(null);
      const payload = toUpdatePayload(editingId, editForm);

      if (editImageFile) {
        const uploaded = await uploadProductImage(editImageFile);
        payload.imageUrl = uploaded.imageUrl;
      }

      await updateMutation.mutateAsync(payload);
      cancelEdit();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Не вдалося оновити товар');
    }
  };

  const onDeleteProduct = async (product: AdminProduct) => {
    const isConfirmed = window.confirm(
      `Видалити товар "${product.name}" (SKU: ${product.sku})?`,
    );
    if (!isConfirmed) {
      return;
    }

    try {
      setLocalError(null);
      await deleteMutation.mutateAsync(product.id);
      if (editingId === product.id) {
        cancelEdit();
      }
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Не вдалося видалити товар');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-primary-content">Управління Товарами</h2>
        <p className="text-sm text-copy-light">Додавайте та редагуйте товари каталогу.</p>
      </div>

      <form
        onSubmit={onCreateSubmit}
        className="grid gap-3 rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4"
      >
        <p className="flex items-center gap-2 text-sm font-bold text-primary-content md:col-span-2 xl:col-span-4">
          <Plus className="h-4 w-4" />
          Додати товар
        </p>

        <input
          value={createForm.name}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Назва"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          required
        />
        <input
          value={createForm.sku}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, sku: event.target.value }))}
          placeholder="SKU"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          required
        />
        <input
          value={createForm.price}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, price: event.target.value }))}
          placeholder="Ціна"
          type="number"
          min="0.01"
          step="0.01"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          required
        />
        <select
          value={createForm.availabilityStatus}
          onChange={(event) =>
            setCreateForm((prev) => ({
              ...prev,
              availabilityStatus: event.target.value as AvailabilityStatus,
            }))
          }
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          value={createForm.categoryName}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, categoryName: event.target.value }))}
          placeholder="Категорія (назва)"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          required
        />
        <input
          value={createForm.categorySlug}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, categorySlug: event.target.value }))}
          placeholder="Категорія (slug)"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          required
        />
        <select
          value={createForm.productType}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, productType: event.target.value as ProductKind }))
          }
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        >
          {PRODUCT_TYPES.map((type) => (
            <option key={type} value={type}>
              {PRODUCT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        <input
          value={createForm.slug}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, slug: event.target.value }))}
          placeholder="Slug (optional)"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          value={createForm.variantGroup}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, variantGroup: event.target.value }))}
          placeholder="Група варіантів (optional, напр. top-tec-4100-5w40)"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          value={createForm.volumeLiters}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, volumeLiters: event.target.value }))}
          placeholder="Об'єм, літрів (optional)"
          type="number"
          min="0.1"
          step="0.1"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        />
        <input
          value={createForm.brandName}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, brandName: event.target.value }))}
          placeholder="Бренд (optional)"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        />
        <select
          value={createForm.viscosityName}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, viscosityName: event.target.value }))
          }
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        >
          {VISCOSITY_OPTIONS.map((value) => (
            <option key={value || 'empty'} value={value}>
              {value || "В'язкість (optional)"}
            </option>
          ))}
        </select>
        <input
          value={createForm.oilTypeName}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, oilTypeName: event.target.value }))}
          placeholder="Тип оливи (optional)"
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={createForm.isActive}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))
            }
          />
          Активний
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={createForm.isNew}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, isNew: event.target.checked }))
            }
          />
          Новинка
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={createForm.isPopular}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, isPopular: event.target.checked }))
            }
          />
          Популярний товар
        </label>
        <label className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-2">
          <span className="mb-2 block text-xs text-copy-light">Фото товару (optional)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => setCreateImageFile(event.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-4">
          <input
            type="checkbox"
            checked={createVolumeVariants}
            onChange={(event) => setCreateVolumeVariants(event.target.checked)}
          />
          Створити одразу варіанти обʼєму (окремі товари з різними SKU: 1л/4л/5л)
        </label>

        {createVolumeVariants && (
          <div className="rounded-xl border border-border bg-white px-3 py-3 text-sm md:col-span-2 xl:col-span-4">
            <p className="mb-2 text-xs text-copy-light">
              Базова назва береться з поля &quot;Назва&quot;. Якщо там уже є &quot;1л&quot; або &quot;5л&quot;, вона буде прибрана автоматично.
            </p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_VARIANT_VOLUMES.map((volume) => {
                const isSelected = selectedVariantVolumes.includes(volume);
                return (
                  <button
                    key={volume}
                    type="button"
                    onClick={() =>
                      setSelectedVariantVolumes((prev) =>
                        prev.includes(volume)
                          ? prev.filter((item) => item !== volume)
                          : [...prev, volume],
                      )
                    }
                    className={`rounded-lg border px-3 py-1.5 transition-colors ${
                      isSelected
                        ? 'border-primary-content bg-primary-content text-white'
                        : 'border-border bg-white text-copy'
                    }`}
                  >
                    {formatVolumeLabel(volume)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <textarea
          value={createForm.description}
          onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Опис"
          rows={3}
          className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-4"
          required
        />

        {(localError || createMutation.error) && (
          <p className="text-sm text-red-500 md:col-span-2 xl:col-span-4">
            {localError || createMutation.error?.message}
          </p>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-content transition hover:bg-primary-light disabled:opacity-60 md:col-span-2 xl:col-span-4"
        >
          {createMutation.isPending ? 'Створення...' : 'Створити товар'}
        </button>
      </form>

      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm">
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Пошук за назвою, SKU, брендом..."
            className="w-full rounded-full border border-border bg-white py-2 pl-10 pr-4 text-sm text-foreground shadow-inner outline-none transition-all placeholder:text-copy-lighter focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copy-lighter" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white/70 shadow-inner">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-white/60 uppercase text-copy-lighter">
            <tr>
              <th className="px-6 py-4 font-medium">Фото</th>
              <th className="px-6 py-4 font-medium">SKU / Назва</th>
              <th className="px-6 py-4 font-medium">Бренд / Тип</th>
              <th className="px-6 py-4 font-medium">Ціна</th>
              <th className="px-6 py-4 font-medium">Наявність</th>
              <th className="px-6 py-4 font-medium text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {productsQuery.isPending && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-copy-light">
                  Завантаження товарів...
                </td>
              </tr>
            )}

            {productsQuery.isError && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-400">
                  {productsQuery.error.message}
                </td>
              </tr>
            )}

            {filteredProducts.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-white/80">
                <td className="px-6 py-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-border bg-white">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-copy-lighter">
                        Немає
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-primary-content">{product.name}</div>
                  <div className="mt-1 text-xs text-copy-lighter">{product.sku}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-copy">{product.brandName || '—'}</div>
                  <div className="mt-1 text-xs text-copy-lighter">
                    {PRODUCT_TYPE_LABELS[product.productType]}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-primary-content">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${availabilityBadge(product.availabilityStatus)}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {availabilityLabel(product.availabilityStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Редагувати
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && !productsQuery.isPending && !productsQuery.isError && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-copy-light">
                  Товари не знайдено.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId && (
        <form
          onSubmit={onEditSubmit}
          className="grid gap-3 rounded-2xl border border-white/10 bg-white/80 p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4"
        >
          <p className="text-sm font-bold text-primary-content md:col-span-2 xl:col-span-4">
            Редагування товару
          </p>

          <input
            value={editForm.name}
            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Назва"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
            required
          />
          <input
            value={editForm.sku}
            onChange={(event) => setEditForm((prev) => ({ ...prev, sku: event.target.value }))}
            placeholder="SKU"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
            required
          />
          <input
            value={editForm.price}
            onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="Ціна"
            type="number"
            min="0.01"
            step="0.01"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
            required
          />
          <select
            value={editForm.availabilityStatus}
            onChange={(event) =>
              setEditForm((prev) => ({
                ...prev,
                availabilityStatus: event.target.value as AvailabilityStatus,
              }))
            }
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={editForm.categoryName}
            onChange={(event) => setEditForm((prev) => ({ ...prev, categoryName: event.target.value }))}
            placeholder="Категорія (назва)"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
            required
          />
          <input
            value={editForm.categorySlug}
            onChange={(event) => setEditForm((prev) => ({ ...prev, categorySlug: event.target.value }))}
            placeholder="Категорія (slug)"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
            required
          />
          <select
            value={editForm.productType}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, productType: event.target.value as ProductKind }))
            }
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {PRODUCT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <input
            value={editForm.slug}
            onChange={(event) => setEditForm((prev) => ({ ...prev, slug: event.target.value }))}
            placeholder="Slug"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            value={editForm.variantGroup}
            onChange={(event) => setEditForm((prev) => ({ ...prev, variantGroup: event.target.value }))}
            placeholder="Група варіантів"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            value={editForm.volumeLiters}
            onChange={(event) => setEditForm((prev) => ({ ...prev, volumeLiters: event.target.value }))}
            placeholder="Об'єм, літрів"
            type="number"
            min="0.1"
            step="0.1"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <input
            value={editForm.brandName}
            onChange={(event) => setEditForm((prev) => ({ ...prev, brandName: event.target.value }))}
            placeholder="Бренд"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <select
            value={editForm.viscosityName}
            onChange={(event) =>
              setEditForm((prev) => ({ ...prev, viscosityName: event.target.value }))
            }
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            {VISCOSITY_OPTIONS.map((value) => (
              <option key={value || 'empty'} value={value}>
                {value || "В'язкість (optional)"}
              </option>
            ))}
          </select>
          <input
            value={editForm.oilTypeName}
            onChange={(event) => setEditForm((prev) => ({ ...prev, oilTypeName: event.target.value }))}
            placeholder="Тип оливи"
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(event) => setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Активний
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={editForm.isNew}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, isNew: event.target.checked }))
              }
            />
            Новинка
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={editForm.isPopular}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, isPopular: event.target.checked }))
              }
            />
            Популярний товар
          </label>
          <label className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-2">
            <span className="mb-2 block text-xs text-copy-light">Нове фото (optional)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setEditImageFile(event.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </label>

          <textarea
            value={editForm.description}
            onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Опис"
            rows={3}
            className="rounded-xl border border-border bg-white px-3 py-2 text-sm md:col-span-2 xl:col-span-4"
            required
          />

          {(localError || createMutation.error || updateMutation.error) && (
            <p className="text-sm text-red-500 md:col-span-2 xl:col-span-4">
              {localError || createMutation.error?.message || updateMutation.error?.message}
            </p>
          )}

          <div className="flex gap-2 md:col-span-2 xl:col-span-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-content disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
