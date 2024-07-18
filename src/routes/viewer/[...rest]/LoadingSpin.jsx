import React from "react";

const LoadingSpin = ({className}) => {
    return (
        <div className={`${className}  flex justify-center items-center`}>
            <div className={` w-full h-full border-4 border-t-primary border-b-green-300 rounded-full animate-spin`}/>
        </div>
    );
}

export default LoadingSpin;