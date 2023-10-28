import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { type Dispatch, Fragment, type SetStateAction } from "react";

export const Tutorial = ({
  isTutorialOpen,
  setIsTutorialOpen,
}: {
  isTutorialOpen: boolean;
  setIsTutorialOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Transition appear show={isTutorialOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsTutorialOpen(false)}
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
                    Game Tutorial
                  </Dialog.Title>
                  <button onClick={() => setIsTutorialOpen(false)}>
                    <XMarkIcon className="h-10 w-10" />
                  </button>
                </div>
                <div className="mt-2 h-[80%]">
                  <iframe
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/i_I5Z9eOK6k?si=TuU_PYX5nR4Atc0L"
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
