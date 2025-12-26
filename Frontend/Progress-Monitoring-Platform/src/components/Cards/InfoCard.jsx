import React from 'react'

const InfoCard = ({icon, label, value, color}) => {
  return (
    <div className={`flex items-center p-4 rounded-lg shadow-md ${color}`}>
        
        <div className="p-3 rounded-full bg-white bg-opacity-20 mr-4">
            {icon && <span className="text-white text-2xl mr-2">{icon}</span>}
        </div>

        <div>
          <p className="text-white text-2xl font-semibold">{value}</p>
          {label && <p className="text-white text-sm opacity-75">{label}</p>}
        </div>
    </div>
    )
}

export default InfoCard;