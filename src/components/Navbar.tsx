import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex gap-6">
        <Link href="/dashboard" className="hover:text-blue-200 font-semibold">Buscador</Link>
        <Link href="/distribucion" className="hover:text-blue-200">Distribución</Link>
        <Link href="/ngrams" className="hover:text-blue-200">N-gramas</Link>
        <Link href="/porcentaje" className="hover:text-blue-200">Porcentajes</Link>
      </div>
    </nav>
  );
}
