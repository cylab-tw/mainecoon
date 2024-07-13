import React, {useContext} from 'react'
import {ServerContext} from "../../lib/ServerContext.jsx";
import {CombineSearchURL} from "../../lib/search/index.js";

const SearchForm = ({name, setSearchResults, Parameter, pageLimit, pageOffset, setIsMouseOn, setIsLoading}) => {
    const [parameter, setParameter] = Parameter;
    const [server, setServer] = useContext(ServerContext)

    const handlequeryParameterChange = (e) => {
        const {name, value} = e.target;
        setParameter({...parameter, [name]: value})
    }

    const searchBtnOnClick = async (e) => {
        e.preventDefault()
        setIsLoading(true);
        const searchUrl = CombineSearchURL(parameter, server, pageLimit, pageOffset);
        fetch(searchUrl)
            .then(response => {
                if(response.status === 204){
                    return []
                }else{
                    return response.json()
                }
            })
            .then(data => {
                setSearchResults(data);
                setIsLoading(false)
            })
        setIsMouseOn(false)
    }

    return (
        <form onSubmit={(e) => searchBtnOnClick(e)} className="flex flex-fill flex-column">
            <div className="flex w-full">
                <div className="flex items-center me-2 font-bold">{name}</div>
                <input
                    type={name === "StudyDate" ? "date" : "text"}
                    className="border-2 m-2 p-2 rounded-lg text-black w-full"
                    name={name} value={parameter[name]}
                    onChange={(e) => {
                        handlequeryParameterChange(e)
                    }}
                />
            </div>
            {name === "PatientID" && (
                <button type="submit" className="border-2 m-2 rounded-lg px-2"
                        onClick={searchBtnOnClick}>Search</button>)}
        </form>
    )
}

export default SearchForm