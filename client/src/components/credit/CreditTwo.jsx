import React, { useState } from 'react';
import { FaCoins } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa";


const CreditPoints = ({points,plan}) => {

    return (
        <div className="bg-gray-100  rounded-lg flex items-center justify-between p-2">
        <div className="flex items-center text-white p-2 rounded-lg">
            <span className="text-lg font-medium text-black">{points} credits</span>
        </div>
        <div className="bg-slate-100 p-3 rounded-lg text-center cursor-pointer bg-white">
            <FaPlus
            
            />
        </div>
    </div>
    );
};

export default CreditPoints;
