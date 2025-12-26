import React, { useRef, useState } from 'react';
import { LuUser, LuUpload, LuTrash } from 'react-icons/lu';

const ProfilePicSelector = ({image, setimage}) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            //Update the image state
            setimage(file);

            //Generate preview URL from the file
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);
        }
    };

    const handleRemoveImage = () => {
        setimage(null);
        setPreview(null);
    };

    const onChooseFile = () => {
        inputRef.current.click();
    };

  return <div className="">
    <input
    type='file'
    accept='image/*'
    ref={inputRef}
    onChange={handleImageChange}
    className=''
    />

    {!image ? (
        <div className='w-20 h-20 flex items-center justify-center bg-blue-100/50 rounded-full relative cursor-pointer'>
            <LuUser className='text-4xl text-primary'/>
                <button
                type='button'
                className='w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer'
                onClick={onChooseFile}
            >
                <LuUpload />
            </button>
        </div>
    ) : (
        <div className='relative'>
            <img 
            src={preview}
            alt='profile photo'
            className='w-20 h-20 rounded-full object-cover'
            />
            <button
            type='button'
            className='w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 '
            onClick={handleRemoveImage}
            >
                <LuTrash />
            </button>
        </div>
    )}
  </div>

};

export default ProfilePicSelector