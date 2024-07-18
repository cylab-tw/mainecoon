import React from "react";

const LoadingSpin = () => {
    return (
        <div className="w-full h-full flex justify-center">
            <div className="w-8 h-8 mt-10 border-4 border-t-primary border-b-green-400 rounded-full animate-spin"/>
        </div>
    );
}

export default LoadingSpin;