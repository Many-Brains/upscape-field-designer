import { MagicLinkForm } from "../components/Auth/MagicLinkForm";

export function LoginRoute() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-2">UPSCAPE</h1>
      <p className="text-gray-400 mb-8">Field Designer</p>
      <MagicLinkForm />
    </div>
  );
}
