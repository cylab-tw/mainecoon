import React,{useContext} from 'react'
import {ServerContext} from "../../lib/ServerContext.jsx";

const Server = () => {
    const [server,setServer] = useContext(ServerContext)
    const handleChangeServer = (e) => {
        setServer(e.target.value)
    }

    return(
        <div className="flex items-center text-black mr-3">
            <select
                className="bg-white w-fit h-10 justify-center flex mx-2 p-2 rounded-lg mb-1 text-black"
                onChange={handleChangeServer}>
                <option value="NTUNHS">NTUNHS</option>
                <option value="GOOGLE">GOOGLE</option>
            </select>
        </div>
    )
}

export default Server;