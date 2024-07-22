import React from "react";

const LoadingSpin = ({className,spinClassName}) => {
    return (
        <div className="h-full flex items-center justify-center">
            <div
                className="w-4 h-4 border-b-green-400 rounded-full animate-spin" style={{borderWidth: '3px'}}/>
        </div>
    );
}

export default LoadingSpin;