import { Spinner } from '@/components/shared/spinner';

export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  );
}
