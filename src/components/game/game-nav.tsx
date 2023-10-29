import { Popover, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  ChatBubbleBottomCenterIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";
import clipboard from "clipboardy";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

export function GameNav({
  setIsTutorialOpen,
}: {
  setIsTutorialOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const handleCopy = async () => {
    await clipboard.write(
      `${
        process.env.NODE_ENV === "development"
          ? "localhost:3000"
          : "https://qwixxwithfriends.com"
      }` + router.asPath
    );
    toast.success("Game link copied!");
  };

  const handleHowToPlay = () => {
    setIsTutorialOpen((prev) => !prev);
  };
  return (
    <div>
      <div className="flex justify-between md:hidden">
        <div>
          <button
            onClick={() => void router.push("/")}
            className="flex items-center gap-2 px-4 py-2 text-white active:bg-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Home</span>
          </button>
        </div>
        <div className="">
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className={`
                ${open ? "text-white" : "text-white/90"}
                group inline-flex items-center rounded-md px-3 py-2 text-base font-medium hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                >
                  <span>More</span>
                  <ChevronDownIcon
                    className={`${open ? "text-white" : "text-white/70"}
                  ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-white/80`}
                    aria-hidden="true"
                  />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute -left-20 z-10 mt-3">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5">
                      <div className="relative grid gap-2 bg-white p-1">
                        <div>
                          <Link href="/new-game">
                            <button className="flex items-center gap-2 px-4 py-2 active:bg-gray-200">
                              <PlusIcon className="h-4 w-4" />
                              <span>New Game</span>
                            </button>
                          </Link>
                        </div>
                        <div>
                          <button
                            onClick={() => void handleCopy()}
                            className="flex items-center gap-2 px-4 py-2 active:bg-gray-200"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                            <span>Share Game</span>
                          </button>
                        </div>
                        <div>
                          <button
                            onClick={() => void handleHowToPlay()}
                            className="flex items-center gap-2 px-4 py-2 active:bg-gray-200"
                          >
                            <QuestionMarkCircleIcon className="h-4 w-4" />
                            <span>Game Rules</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
      <div className="hidden justify-center gap-4 p-1 md:flex md:p-2">
        <div>
          <button
            onClick={() => void handleCopy()}
            className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Home</span>
          </button>
        </div>
        <div>
          <Link href="/new-game">
            <button className="rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base">
              New Game
            </button>
          </Link>
        </div>
        <div>
          <button
            onClick={() => void handleCopy()}
            className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base"
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            <span>Copy Game Link</span>
          </button>
        </div>
        <div>
          <button
            onClick={() => void handleHowToPlay()}
            className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base"
          >
            <QuestionMarkCircleIcon className="h-4 w-4" />
            <span>Game Rules</span>
          </button>
        </div>
        {/* <div>
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base"
        >
          <ChatBubbleBottomCenterIcon className="h-4 w-4" />
          <span>Chat</span>
        </button>
      </div> */}
      </div>
    </div>
  );
}
