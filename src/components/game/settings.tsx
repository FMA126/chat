import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import {
  type Dispatch,
  Fragment,
  type SetStateAction,
  useState,
  useRef,
} from "react";
import { api } from "~/utils/api";
import Spinner from "../shared/spinner";
import toast from "react-hot-toast";

export const Settings = ({
  showEditName,
  setShowEditName,
}: {
  showEditName: boolean;
  setShowEditName: Dispatch<SetStateAction<boolean>>;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const utils = api.useContext();
  const session = useSession();
  const userNameRef = useRef<HTMLInputElement>(null);
  const { data } = api.settings.getUserName.useQuery();
  const { mutate } = api.settings.updateUserName.useMutation({
    onMutate() {
      setIsSubmitting(true);
    },
    async onSettled() {
      await utils.game.invalidate();
      await session.update();
      toast("updated user name");
      setIsSubmitting(false);
      setShowEditName(false);
    },
  });
  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (userNameRef.current) {
      mutate({ name: userNameRef.current.value });
    }
  };
  return (
    <Transition appear show={showEditName} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setShowEditName(false)}
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
                    Settings
                  </Dialog.Title>
                  <button onClick={() => setShowEditName(false)}>
                    <XMarkIcon className="h-10 w-10" />
                  </button>
                </div>
                {!data ? (
                  <div>...loading</div>
                ) : (
                  <div className="mt-2 h-[80%]">
                    <form onSubmit={handleSubmit}>
                      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="first-name"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            User name
                          </label>
                          <div className="mt-2">
                            <input
                              ref={userNameRef}
                              type="text"
                              name="userName"
                              id="userName"
                              autoComplete="user-name"
                              placeholder={data.userName ?? ""}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          className="text-sm font-semibold leading-6 text-gray-900"
                        >
                          {isSubmitting ? (
                            <Spinner height="6" width="6" color="red-500" />
                          ) : (
                            <span>Cancel</span>
                          )}
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          {isSubmitting ? (
                            <Spinner height="6" width="6" color="blue-500" />
                          ) : (
                            <span>Save</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
