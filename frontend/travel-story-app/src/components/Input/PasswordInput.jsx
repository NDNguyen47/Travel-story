import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({ value, onChange, placeholder }) => {

    const [showPassword, setShowPassword] = useState(false);

    const toogleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className=' flex items-center bg-cyan-600/5 px-5 rounded mb-3'>
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Password"}
                type={showPassword ? "text" : "password"}
                className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'

            />
            {showPassword ? (
                <FaRegEye
                    size={22}
                    className='text-primary cursor-pointer'
                    onClick={() => toogleShowPassword()}
                />
            ) : (
                <FaRegEyeSlash
                    size={22}
                    className='text-primary cursor-pointer'
                    onClick={() => toogleShowPassword()}
                />
            )}
        </div>
    )
}

export default PasswordInput
