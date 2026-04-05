import { CatalogProduct } from './types';

const VOLUME_PATTERN = /\b(\d+(?:[.,]\d+)?)\s*(?:л|l)\b/i;
const VOLUME_PART_PATTERN = /\b\d+(?:[.,]\d+)?\s*(?:л|l)\b/gi;
const TRAILING_CODE_PATTERN = /\(\s*\d{2,}\s*\)$/g;
const STOP_WORDS = new Set([
  'sae',
  'л',
  'l',
  'моторна',
  'олива',
  'масло',
]);

export function extractVolumeLiters(
  value: Pick<CatalogProduct, 'name' | 'volumeLiters'> | string,
): number | null {
  if (typeof value !== 'string') {
    if (
      typeof value.volumeLiters === 'number' &&
      Number.isFinite(value.volumeLiters) &&
      value.volumeLiters > 0
    ) {
      return value.volumeLiters;
    }
  }

  const name = typeof value === 'string' ? value : value.name;
  const match = name.match(VOLUME_PATTERN);
  if (!match) {
    return null;
  }

  const volume = Number(match[1].replace(',', '.'));
  return Number.isFinite(volume) ? volume : null;
}

export function getVolumeLabel(name: string): string {
  const volume = extractVolumeLiters(name);
  return volume === null ? '1л' : `${String(volume).replace('.', ',')}л`;
}

function normalizeBaseName(name: string, brandName?: string | null): string {
  const normalizedBrand = (brandName ?? '').toLowerCase().trim();
  const escapedBrand = normalizedBrand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return name
    .toLowerCase()
    .replace(new RegExp(`^${escapedBrand}\\s+`, 'i'), '')
    .replace(VOLUME_PART_PATTERN, '')
    .replace(TRAILING_CODE_PATTERN, '')
    .replace(/\bsae\b/g, ' ')
    .replace(/[.,()[\]{}]/g, ' ')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildFamilyKey(product: CatalogProduct): string {
  const explicitGroup = product.variantGroup?.trim().toLowerCase();
  if (explicitGroup) {
    return `group:${explicitGroup}`;
  }

  return normalizeBaseName(product.name, product.brandName);
}

function tokenizeFamilyName(name: string): string[] {
  return name
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => token.length > 1);
}

function sameBrand(a: CatalogProduct, b: CatalogProduct): boolean {
  const left = (a.brandName ?? '').trim().toLowerCase();
  const right = (b.brandName ?? '').trim().toLowerCase();

  if (!left || !right) {
    return true;
  }

  return left === right;
}

export function isSameProductFamily(
  base: CatalogProduct,
  candidate: CatalogProduct,
): boolean {
  if (base.id === candidate.id) {
    return true;
  }

  const baseGroup = base.variantGroup?.trim().toLowerCase();
  const candidateGroup = candidate.variantGroup?.trim().toLowerCase();
  if (baseGroup || candidateGroup) {
    return Boolean(baseGroup && candidateGroup && baseGroup === candidateGroup);
  }

  if (!sameBrand(base, candidate)) {
    return false;
  }

  const baseName = buildFamilyKey(base);
  const candidateName = buildFamilyKey(candidate);

  if (!baseName || !candidateName) {
    return false;
  }

  if (baseName === candidateName) {
    return true;
  }

  if (baseName.includes(candidateName) || candidateName.includes(baseName)) {
    return true;
  }

  const baseTokens = tokenizeFamilyName(baseName);
  const candidateTokens = tokenizeFamilyName(candidateName);
  if (!baseTokens.length || !candidateTokens.length) {
    return false;
  }

  const baseSet = new Set(baseTokens);
  const candidateSet = new Set(candidateTokens);
  let intersection = 0;

  for (const token of baseSet) {
    if (candidateSet.has(token)) {
      intersection += 1;
    }
  }

  const union = new Set([...baseSet, ...candidateSet]).size;
  const jaccard = union ? intersection / union : 0;

  return jaccard >= 0.72;
}

export function sortVariantsByVolume<
  T extends { name: string; volumeLiters?: number | null },
>(variants: T[]): T[] {
  return [...variants].sort((left, right) => {
    const leftVolume = extractVolumeLiters({
      name: left.name,
      volumeLiters: left.volumeLiters ?? null,
    });
    const rightVolume = extractVolumeLiters({
      name: right.name,
      volumeLiters: right.volumeLiters ?? null,
    });

    if (leftVolume !== null && rightVolume !== null && leftVolume !== rightVolume) {
      return leftVolume - rightVolume;
    }

    if (leftVolume !== null && rightVolume === null) {
      return -1;
    }

    if (leftVolume === null && rightVolume !== null) {
      return 1;
    }

    return left.name.localeCompare(right.name, 'uk');
  });
}

export function groupCatalogProductsByVariants(
  products: CatalogProduct[],
): Array<{ base: CatalogProduct; variants: CatalogProduct[] }> {
  const groups: CatalogProduct[][] = [];

  for (const product of products) {
    const match = groups.find((group) =>
      isSameProductFamily(group[0], product),
    );
    if (match) {
      match.push(product);
    } else {
      groups.push([product]);
    }
  }

  return groups.map((items) => {
    const variants = sortVariantsByVolume(items);
    return {
      base: variants[0],
      variants,
    };
  });
}
