export default function CatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>;
}
