import { Dialog, Transition } from "@headlessui/react";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import TextareaAutosize from "react-textarea-autosize";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useState,
  useRef,
  useEffect,
} from "react";
import { api } from "~/utils/api";
import { joinClassNames } from "~/utils/joinClassNames";
import { useRouter } from "next/router";

export const Chat = ({
  isChatOpen,
  setIsChatOpen,
}: {
  isChatOpen: boolean;
  setIsChatOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const { mutate } = api.game.createMessage.useMutation();

  // const sendMessage = async () => {
  //   if(!input) return
  //   setIsLoading(true)

  //   try {
  //     await axios.post('/api/message/send', { text: input, chatId })
  //     setInput('')
  //     textareaRef.current?.focus()
  //   } catch {
  //     toast.error('Something went wrong. Please try again later.')
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const sendMessage = () => {
    mutate({ message: input, gameId: router.query.gid as string });
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="rounded-xl bg-white">
      <div className="rounded-xl border">
        <div className={joinClassNames("flex justify-end p-1")}>
          <div className="rounded-xl bg-gray-100 p-1 shadow-lg">
            <div>Merritt</div>
            <div>Hey whats up</div>
          </div>
        </div>
        <div className={joinClassNames("flex justify-start p-1")}>
          <div className="rounded-xl bg-green-400 p-1 shadow-lg">
            <div>Brooke</div>
            <div>Hi</div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="grow pt-1">
          <TextareaAutosize
            ref={textareaRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message`}
            className="w-full border-0 bg-white/0 pl-1 text-xl ring-0 focus:border-0 focus:outline-none"
          />
        </div>

        <div className="self-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            onClick={() => setIsChatOpen(false)}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
