import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//axios
import axiosInstance from '../../utils/axiosInstance';
//component
import Navbar from '../../components/Input/Navbar';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
// toast
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// icon
import { MdAdd } from 'react-icons/md';
// modal
import Modal from 'react-modal';
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmtyCard from '../../components/Cards/EmtyCard';

import EmtyImg from '../../assets/images/add-story.svg'
import { DayPicker } from 'react-day-picker';
import moment from 'moment';


const Home = () => {
  const navigate = useNavigate()

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState("")

  const [filterType, setFilterType] = useState("")

  const [dateRange, setDateRange] = useState({ from: null, to: null })

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null
  });
  //Get info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user")
      if (response.data && response.data.user) {
        setUserInfo(response.data.user)
      } else {
        throw new Error("User info not found")
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Error fetching user info:", error)
      }
    }
  };

  // Get all stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get("/get-all-stories");
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  // Handle edit
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: 'edit', data: data })
  }

  //Handle Travel click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data })
  }

  const handleUpFavourite = async (storyData) => {
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.put(
        `/update-isFavourite/${storyId}`, {
        isFavourite: !storyData.isFavourite
      }
      );

      if (response.data && response.data.story) {
        toast.success("Story update successfully")
        getAllTravelStories();
      }
    } catch (error) {
      console.error("An unexpected error occurred while updating favourite:", error);
    }
  }

  const deleteTravelStory = async (data) => {
    const storyId = data._id;
    try {
      const response = await axiosInstance.delete(`/delete-story/${storyId}`);
      if (response.data && !response.data.error) {
        toast.success("Story deleted successfully");
        setOpenViewModal((prev) => ({ ...prev, isShown: false }));
        getAllTravelStories();
      } else {
        toast.error("Failed to delete story");
      }
    } catch (error) {
      console.error("An unexpected error occurred while deleting story:", error);
      toast.error("An unexpected error occurred while deleting story");
    }
  }

  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get(`/search`, {
        params: {
          query,
        }
      });

      if (response.data && response.data.stories) {
        setFilterType("search")
        setAllStories(response.data.stories)
      }

    } catch (error) {
      console.error("An unexpected error occurred while deleting story:", error);

    }
  }

  const handleClearSearch = () => {
    setFilterType("")
    getAllTravelStories()
  }

  const filterSroriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null
      const endDate = day.to ? moment(day.to).valueOf() : null

      if (startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: { startDate, endDate }
        });

        if (response.data && response.data.stories) {
          setAllStories(response.data.stories);
          setFilterType("date");
        }
      }
    } catch (error) {
      console.error("An unexpected error occurred while filtering stories by date:", error);
    }
  }
  const handleDayClick = (day) => {
    setDateRange(day);
    filterSroriesByDate(day);
  }

  const resetFilter = () => {
    setDateRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  }


  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, [])

  return (
    <>
      <Navbar userInfo={userInfo} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchNote={onSearchStory} handleClearSearch={handleClearSearch} />
      <div className='container mx-auto py-10'>

        {/* <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onclear={() => {
            resetFilter();
          }}
        /> */}
        <div className='flex gap-7'>
          <div className='flex-1'>
            {allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id}
                    story={item.story}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    visitedDate={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onClick={() => handleViewStory(item)}
                    onFavouriteClick={() => handleUpFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <EmtyCard imgSrc={EmtyImg} message="No travel stories yet. Start creating one!" />
            )}
          </div>
          <div className='w-[320px]'>
            <div className='bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
              <div className='p-3'>
                <DayPicker
                  captionLayout='dropdown-buttons'
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                  className='rounded-lg shadow-md'
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*add and edit story form*/}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          }
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>
      {/*view story form*/}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => setOpenAddEditModal({ isShown: false, type: "add", data: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          }
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((pre) => ({
              ...pre, isShown: false
            }))
          }}
          onEditClick={() => {
            setOpenViewModal((pre) =>
              ({ ...pre, isShown: false }));
            handleEdit(openViewModal.data || null)
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data || null)
          }}
        />
      </Modal>
      <button
        className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10'
        onClick={() => setOpenAddEditModal({ isShown: true, type: 'add', data: null })}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <ToastContainer />
    </>
  )
}

export default Home
