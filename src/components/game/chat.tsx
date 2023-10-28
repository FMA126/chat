import { Dialog, Transition } from "@headlessui/react";
import { PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/solid";
import TextareaAutosize from "react-textarea-autosize";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useState,
  useRef,
} from "react";
import { api } from "~/utils/api";
import { joinClassNames } from "~/utils/joinClassNames";

export const Chat = ({
  isChatOpen,
  setIsChatOpen,
}: {
  isChatOpen: boolean;
  setIsChatOpen: Dispatch<SetStateAction<boolean>>;
}) => {
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

  return (
    <Transition appear show={isChatOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsChatOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="h-[90vh] w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Chat
                  </Dialog.Title>
                  <button onClick={() => setIsChatOpen(false)}>
                    <XMarkIcon className="h-10 w-10" />
                  </button>
                </div>
                <div className="mt-2">
                  <Messages />
                </div>

                <div className="mb-2 border-t border-gray-200 pt-4 sm:mb-0">
                  <div className="relative flex-1 overflow-hidden rounded-lg">
                    <TextareaAutosize
                      ref={textareaRef}
                      onKeyDown={(e) => {
                        // if (e.key === 'Enter' && !e.shiftKey) {
                        //   e.preventDefault()
                        //   sendMessage()
                        // }
                      }}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Message`}
                      className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:border-0 focus:ring-0 focus:ring-offset-0 sm:py-1.5 sm:text-sm sm:leading-6"
                    />

                    <div
                      onClick={() => textareaRef.current?.focus()}
                      className="py-2"
                      aria-hidden="true"
                    >
                      <div className="py-px">
                        <div className="h-9" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 right-0 flex justify-between">
                      <div className="flex-shrink-0">
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const Messages = () => {
  return (
    <div className="rounded-xl border">
      <div className={joinClassNames("flex justify-end p-1")}>
        <div className="rounded-xl bg-green-400 p-1 shadow-lg">
          <div>Merritt</div>
          <div>Hey whats up</div>
        </div>
      </div>
      <div className="rounded-xl bg-gray-100 p-1 shadow-lg">
        <div>Brooke</div>
        <div>Hi</div>
      </div>
    </div>
  );
};
