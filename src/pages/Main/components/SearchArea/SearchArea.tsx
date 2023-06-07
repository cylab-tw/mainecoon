import React from 'react';
import _ from "lodash";

import { SearchHeader } from "./components/SearchHeader";
import { SearchResultList } from "./components/SearchResultList";




const SearchArea: React.FC = () => {
    return <>
        <div className="bg-white bg-opacity-10 w-50 w-lg-400px d-flex flex-column border-start border-end">
            <SearchHeader />
            <SearchResultList />
        </div>
    </>
};

export default SearchArea;
