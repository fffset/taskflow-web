import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

// Kart grid'i şeklindeki liste sayfaları için (workspace, project, board
// listeleri) tutarlı bir loading skeleton'ı.
export function ListSkeleton({ count = 3, className = 'h-32' }: ListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${className} rounded-xl`} />
      ))}
    </div>
  );
}

// Sayfa başlığı + kart grid'i birlikte — sayfanın tamamı yüklenirken
export function PageSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
      <ListSkeleton count={count} />
    </div>
  );
}