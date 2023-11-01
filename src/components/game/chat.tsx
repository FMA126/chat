import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
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
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { usePusher } from "~/lib/usePusherClient";
import { LoaderIcon } from "react-hot-toast";

export const Chat = ({
  setUnseenMessages,
}: {
  setUnseenMessages: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const session = useSession();
  const utils = api.useContext();
  const pusher = usePusher();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPostingMessage, setIsPostingMessage] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const { data: messages } = api.game.getMessages.useQuery(
    { gameId: router.query.gid as string },
    { enabled: !!router.query.gid }
  );
  const { mutate } = api.game.createMessage.useMutation({
    onMutate() {
      setIsPostingMessage(true);
    },
    async onSettled() {
      await utils.game.getMessages.invalidate();
      setIsPostingMessage(false);
      setInput("");
    },
  });

  const sendMessage = (input: string) => {
    mutate({ message: input, gameId: router.query.gid as string });
  };

  const scrollToBottom = () => {
    void messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    scrollToBottom();
    textareaRef.current?.focus();
    setUnseenMessages(false);
  }, [messages]);

  return (
    <div className="flex h-[70vh] flex-col rounded-xl bg-white">
      <div className="basis-[95%] overflow-auto rounded-xl border">
        {messages?.map((message, messageIdx) => (
          <div
            key={messageIdx}
            className={joinClassNames(
              message.userId === session.data?.user.id
                ? "justify-end"
                : "justify-start",
              "flex p-1"
            )}
          >
            <div
              className={joinClassNames(
                message.userId === session.data?.user.id
                  ? "bg-gray-100"
                  : "bg-green-400",
                "max-w-[70vw] rounded-xl p-1 shadow-lg"
              )}
            >
              <div className="flex items-baseline gap-1">
                <div
                  className={joinClassNames(
                    message.userId === session.data?.user.id
                      ? "text-gray-500"
                      : "text-green-800"
                  )}
                >
                  {message.user.name}
                </div>
                <div
                  className={joinClassNames(
                    message.userId === session.data?.user.id
                      ? "text-gray-300"
                      : "text-green-700",
                    "text-xs"
                  )}
                >
                  {format(new Date(message.createdAt), "p")}
                </div>
              </div>
              <div className="flex max-w-full flex-wrap hyphens-auto p-2">
                {message.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex grow bg-gray-50">
        <div className="grow pt-1">
          <TextareaAutosize
            ref={textareaRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message`}
            disabled={isPostingMessage}
            className={joinClassNames(
              isPostingMessage ? "text-gray-400" : "",
              "w-full border-0 bg-white/0 pl-1 text-xl ring-0 focus:border-0 focus:outline-none"
            )}
          />
        </div>

        <div className="self-end">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            onClick={() => sendMessage(input)}
            disabled={isPostingMessage}
          >
            {isPostingMessage ? (
              <>
                <LoaderIcon className="animate spin h-4 w-4" />
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
