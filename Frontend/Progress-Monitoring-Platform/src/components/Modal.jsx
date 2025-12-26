import React from 'react'

const Modal = ({ children, isopen, onClose, title}) => {
    if (!isopen) 
        return null;
  return (
    <div className='fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50 '>
        <div className="relative p-4 w-full max-w-2xl max-h-full">
            {/* Modal Content */}
            <div className="relative bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3">
            {/* Modal Header */}
                <div className="flex justify-between items-center border-b p-4 md:p-5 rounded-t dark:border-gray-600 border-gray-200">
                    <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                        {title}
                    </h3>

                    <button
                    onClick={onClose}
                    type="button"
                    className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center'
                    >
                        <svg
                        className='w-3 h-3'
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                        >
                            <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 1l12 12M13 1L1 13"
                            />
                        </svg>
                    </button>
                </div>
                

                {/* Modal Content */}
                <div className="p-4 md:p-5 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    </div>
  )
}

export default Modal