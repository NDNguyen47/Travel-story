import React, { useState } from 'react'
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from 'react-icons/md'
import DateSelector from '../../components/Input/DateSelector'
import ImageSelector from '../../components/Input/ImageSelector'
import TagInput from '../../components/Input/TagInput'
import axiosInstance from '../../utils/axiosInstance'
import moment from 'moment'
import { toast } from 'react-toastify'
import uploadImage from '../../utils/uploadImage'


const AddEditTravelStory = ({
    storyInfo,
    type,
    onClose,
    getAllTravelStories
}) => {
    const [title, setTitle] = useState(storyInfo?.title || "")
    const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null)
    const [story, setStory] = useState(storyInfo?.story || "")
    const [visitedLocation, setVisitedLoaction] = useState(storyInfo?.visitedLocation || [])
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null)
    const [error, setError] = useState("")

    // add new
    const addNewTravelStory = async () => {
        try {
            let imageUrl = "";
            // Upload image if present
            if (storyImg) {
                const imgUploadRes = await uploadImage(storyImg);
                imageUrl = imgUploadRes?.imageUrl || "";
            }

            const storyData = {
                title,
                story,
                imageUrl: imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf(),
            };

            const response = await axiosInstance.post("/add-travel-story", storyData);

            if (response.data && response.data.story) {
                toast.success("Story added successfully");
                getAllTravelStories();
                onClose();
            } else {
                toast.error("Failed to add story");
            }
        } catch (error) {
            if (error.response &&
                error.response.data &&
                error.response.data.message) {
                setError(error.response.data.message)
            } else {
                setError("An unexpected error occur ")
            }
        }
    };
    // update

    const updateTravelStory = async () => {
        const storyId = storyInfo._id;
        try {
            let imageUrl = "";

            let storyData = {
                title: title,
                story: story,
                imageUrl: storyInfo.imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf(),
            };

            if (typeof storyImg === 'object') {
                const imgUploadRes = await uploadImage(storyImg);
                imageUrl = imgUploadRes.imageUrl || "";
                storyData = {
                    ...storyData,
                    imageUrl: imageUrl,
                };
            }

            const response = await axiosInstance.put(`/edit-story/${storyId}`, storyData);

            if (response.data && response.data.story) {
                toast.success("Story updated successfully");
                getAllTravelStories();
                onClose();
            } else {
                toast.error("Failed to update story");
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    const handleAddOrUpdateClick = () => {
        console.log("Input data", { title, storyImg, story, visitedDate, visitedLocation })

        const errors = [];
        if (!title) {
            errors.push("Please enter title");
        }
        if (!story) {
            errors.push("Please enter story");
        }

        if (errors.length > 0) {
            setError(errors.join(", "));
            return;
        }

        setError("")

        if (type === "edit") {
            updateTravelStory();
        } else {
            addNewTravelStory();
        }
    }
    //delete
    const handleDeleteStoryImg = async () => {
        const deleteImageRes = await axiosInstance.delete("/delete-image", {
            params: {
                imageUrl: storyInfo.imageUrl,
            }

        })
        if (deleteImageRes.data) {
            const storyId = storyInfo._id;

            const storyData = {
                title,
                story,
                visitedLocation,
                visitedDate: moment().valueOf(),
                imageUrl: ""
            };
            const response = await axiosInstance.put(`/edit-story/${storyId}`, storyData);
            setStoryImg(null);
        }
    }
    return (
        <div>
            <div className='flex items-center justify-between'>
                <h5 className='text-xl font-medium text-slate-700'>
                    {type === 'add' ? 'Add Travel Story' : 'Edit Travel Story'}
                </h5>
                <div>
                    <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
                        {type === 'add' ? (
                            <button className='btn-small' onClick={handleAddOrUpdateClick}>
                                <MdAdd className='text-lg' /> Add New Story
                            </button>
                        ) : (
                            <>
                                <button className='btn-small' onClick={handleAddOrUpdateClick}>
                                    <MdUpdate className='text-lg' /> Update Existing Story
                                </button>

                                {/* <button className='btn-small btn-delete' onClick={onClose}>
                                    <MdDeleteOutline className='text-lg' /> Delete Story
                                </button> */}

                            </>
                        )}
                        <button className='btn-small' onClick={onClose}>
                            <MdClose className='text-xl text-slate-400' />
                        </button>
                    </div>

                    {error && <p className='text-red-500 text-xs text-right'>{error}</p>}
                </div>
            </div>

            <div>
                <div className='flex-1 flex flex-col gap-2 pt-4'>
                    <label className='input-label'>TITLE</label>
                    <input
                        type="text"
                        className='text-2xl text-slate-950 outline-none'
                        placeholder=' A day at the beach'
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                    />
                    <div className='my-3'>
                        <DateSelector date={visitedDate} setDate={setVisitedDate} />
                    </div>

                    <ImageSelector image={storyImg} setImage={setStoryImg} handleDeleteImg={handleDeleteStoryImg} />

                    <div className='flex flex-col gap-2 mt-4'>
                        <label
                            className='input-label'>Story</label>
                        <textarea
                            type="text"
                            className='tex-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                            placeholder='Your Story'
                            rows={10}
                            value={story}
                            onChange={({ target }) => setStory(target.value)}
                        >
                        </textarea>
                    </div>
                    <div className='pt-3'>
                        <label className="input-label" >VISITED LOCATION</label>
                        <TagInput tags={visitedLocation} setTags={setVisitedLoaction} />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default AddEditTravelStory
