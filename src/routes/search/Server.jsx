import {useContext, useState} from 'react'
import {ServerContext} from "../../lib/ServerContext.jsx";
import {Icon} from "@iconify/react";

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

    return (
        <div className="flex items-center font-bold font-sans text-black mr-3">
            <div className="relative">
                <div
                    onClick={toggleDropdown}
                    className="bg-white w-fit h-10 justify-center items-center flex mx-2 p-2 rounded-lg mb-1 text-black">{server}
                    <Icon icon="line-md:chevron-small-down" className="text-black ml-2"/>
                </div>

                <div className={`rounded border-1 border-gray-300 bg-white absolute top-12 w-full right-2 shadow-md ${dropdown ? '' : 'hidden'}`}>
                    <div className="cursor-pointer hover:bg-gray-200 rounded-t px-4 py-2"
                         onClick={(e) => handleChangeServer(e, "NTUNHS")}>NTUNHS
                    </div>
                    <div className="cursor-pointer hover:bg-gray-200 rounded-b px-4 py-2"
                         onClick={(e) => handleChangeServer(e, "GOOGLE")}>GOOGLE
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Server;