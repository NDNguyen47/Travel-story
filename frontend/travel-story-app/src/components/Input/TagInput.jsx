import React, { useState } from 'react'
import { MdAdd, MdClose } from 'react-icons/md'
import { GrMapLocation } from 'react-icons/gr'

const TagInput = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('')

    const addNewTag = () => {
        if (inputValue.trim() !== '') {
            if (!tags.includes(inputValue)) {
                setTags([...tags, inputValue])
                setInputValue('')
            }
        }
    }

    const handleInputChange = (e) => {
        setInputValue(e.target.value)
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Enter') {
            addNewTag()
        }
    }

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag))
    }

    return (
        <div>
            {JSON.stringify(tags)}
            {tags.length > 0 && (
                <div className='flex gap-2 mt-2'>
                    {tags.map((tag, index) => (
                        <div key={index} className='flex items-center gap-2 bg-cyan-200 px-2 py-1 rounded'>
                            <span key={index}>{tag}</span>
                            <button onClick={() => handleRemoveTag(tag)}>
                                <MdClose className="text-lg text-gray-500 hover:text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className='flex items-center gap-4 mt-3'>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleOnKeyDown}
                    className={`text-sm bg-transparent border px-3 py-2 rounded outline-none`}
                    placeholder='Add Location'
                />
                <button className='' onClick={addNewTag}>
                    <MdAdd className="text-xl text-cyan-500 hover:text-white" />
                </button>
            </div>
        </div>
    )
}

export default TagInput