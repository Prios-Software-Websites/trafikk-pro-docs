import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent } from "@tanstack/react-router";

import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { NotificationsProvider } from "@/lib/notifications";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-sm text-muted-foreground">Siden finnes ikke.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Noe gikk galt</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kjøreflyt" },
      { name: "description", content: "Compliance-først plattform for norske trafikkskoler — dokumentasjon, attestering, rapportering og tilsyn." },
      { property: "og:title", content: "Kjøreflyt" },
      { name: "twitter:title", content: "Kjøreflyt" },
      { property: "og:description", content: "Compliance-først plattform for norske trafikkskoler — dokumentasjon, attestering, rapportering og tilsyn." },
      { name: "twitter:description", content: "Compliance-først plattform for norske trafikkskoler — dokumentasjon, attestering, rapportering og tilsyn." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7a3f1a05-8331-4690-a324-07bcf8cdd34d/id-preview-3f1af065--2da8c7b2-a375-4192-8f22-e8d7536d5502.lovable.app-1778575287268.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7a3f1a05-8331-4690-a324-07bcf8cdd34d/id-preview-3f1af065--2da8c7b2-a375-4192-8f22-e8d7536d5502.lovable.app-1778575287268.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <>
      <HeadContent />
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthProvider>
            <NotificationsProvider>
              <Outlet />
              <Toaster richColors position="top-right" />
            </NotificationsProvider>
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </>
  );
}
