export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: 24 }}>
      <h1>ID: {id}</h1>
    </main>
  );
}
