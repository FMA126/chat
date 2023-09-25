import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

import { GameWindow } from "~/components/game/game-window";
import { joinClassNames } from "~/utils/joinClassNames";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AuthShowcase } from "..";
import { GameLayout } from "~/components/layout/game-layout";

const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};
const navigation = [
  { name: "Dashboard", href: "#", current: true },
  { name: "Team", href: "#", current: false },
  { name: "Projects", href: "#", current: false },
  { name: "Calendar", href: "#", current: false },
  { name: "Reports", href: "#", current: false },
];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

export default function Game() {
  const router = useRouter();
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: session } = useSession();

  if (!session) {
    return <AuthShowcase />;
  }

  return (
    <>
      <GameLayout>
        <GameWindow />
      </GameLayout>
    </>
  );
}
