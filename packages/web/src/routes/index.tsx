import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Fines App</h1>
      <p className="text-gray-600">Welcome to the Fines App.</p>
    </div>
  );
}
