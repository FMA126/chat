import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { PusherProvider } from "~/lib/usePusherClient";
import { env } from "~/env.mjs";
import pusherJs from "pusher-js";

const pusher = new pusherJs(env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
  forceTLS: true,
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <PusherProvider pusher={pusher}>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: "",
            duration: 5000,
            style: {
              background: "#fff",
              color: "#000",
            },
          }}
        />

        <Component {...pageProps} />
      </PusherProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
