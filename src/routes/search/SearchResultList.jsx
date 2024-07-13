import React from 'react';
import SearchResult from "./SearchResult.jsx";
import L_Modal from "../../lib/LoadingModal.jsx";

const SearchResultList = ({searchResults, isLoading}) => {
    return (
        <>
            <div className="flex-grow w-full ">
                <div className="h-full">
                    <table className="w-full mr-2">
                        <thead className="sticky top-0 bg-green-600 ">
                        <tr className="h-12 text-left font-bold text-white">
                            <td className="px-3 py-2">PatientID</td>
                            <td className="px-3 py-2">Name</td>
                            <td className="px-3 py-2">Birth Date</td>
                            <td className="px-3 py-2">Sex</td>
                            <td className="px-3 py-2">Accession Number</td>
                            <td className="px-3 py-2">Study Date</td>
                            <td className="px-3 py-2">Preview</td>
                        </tr>
                        </thead>
                        <tbody>
                        {!isLoading && searchResults.length === 0 ? (
                            <td colSpan={8} className="text-center">
                                <p className="p-5 text-xl font-serif">No Results Found</p>
                            </td>
                        ) : (
                            searchResults.map((result) => {
                                return ( <SearchResult key={result.id} Result={result}/> );
                            }))}
                        </tbody>
                    </table>
                </div>
            </div>
            <L_Modal isOpen={isLoading}><p className="text-black">Loading...</p></L_Modal>

        </>
    );
};

export {SearchResultList};
