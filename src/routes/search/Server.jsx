import React, {useContext, useState} from 'react'
import {ServerContext} from "../../lib/ServerContext.jsx";
import {Icon} from "@iconify/react";
import dicomWebServerConfig from "../../config/DICOMWebServer.config.js";

const Server = () => {
    const [server, setServer] = useContext(ServerContext)
    const [dropdown, setDropdown] = useState(false)
    const handleChangeServer = (e, selectedServer) => {
        setServer(selectedServer);
        setDropdown(!dropdown)
    }
    function toggleDropdown() {
        setDropdown(!dropdown)
    }

    const publicServers = dicomWebServerConfig
    const key = Object.keys(publicServers)

    return (
        <div className="flex">

            <div className="flex bg-green-600 items-center font-bold font-sans text-black">
                <div className="relative z-10 mr-3 ml-3">
                    <div
                        onClick={toggleDropdown}
                        className="bg-white w-fit h-10 justify-center items-center flex mx-2 p-2 rounded-lg mb-1 text-black">
                        {server}
                        <Icon icon="line-md:chevron-small-down" className="text-black ml-2"/>
                    </div>
                    <div className="absolute top-12 right-2 bg-white rounded border-1 border-gray-300 shadow-md">
                        {dropdown && key.map((servername) => (
                                <div key={servername} className="cursor-pointer hover:bg-gray-200 rounded-t px-4 py-2"
                                     onClick={(e) => handleChangeServer(e, servername)}>
                                    {servername}
                                </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>

    )
}

export default Server;