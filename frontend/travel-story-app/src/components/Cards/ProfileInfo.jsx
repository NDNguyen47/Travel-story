import React from 'react'
import { getInitials } from '../../utils/helper'
import { useNavigate } from 'react-router-dom';

const ProfileInfo = ({ userInfo, onLogout }) => {
  const fullName = userInfo?.fullName || ''


  return (
    userInfo && (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
          {getInitials(fullName || "")}
        </div>
        <div className="">
          <p className="text-sm font-medium">{fullName}</p>
          <button className="text-sm underline" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    )
  )
}

export default ProfileInfo