import React from 'react'
import { FaSpinner } from 'react-icons/fa'; // Import the loader icon


function Button({ loading, text,onClick }) {

    console.log("Loading");
    console.log(loading);
    return (
        <>
        {!loading ?
        <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
            onClick={onClick}
        
        >
           
                
                    {text}
                
            

        </button>:
          <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-md bg-black px-3.5 py-2.5 font-semibold leading-7 text-white hover:bg-black/80"
      
      >
         
              
         <FaSpinner className="animate-spin mr-2" size={24} />
              
          

      </button>
}
</>
        
    )
}



export default Button