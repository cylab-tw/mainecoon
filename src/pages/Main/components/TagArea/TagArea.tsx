import React from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import { addTestTag } from "Slices/tagListSlice";

const TagHeader: React.FC = () => {
    return <>
        <nav className="navbar bg-white border-bottom h-navbarh">
            <div className="container-fluid">
                <a className="navbar-brand text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-tag" viewBox="0 0 16 16">
                        <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                        <path d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z" />
                    </svg>
                    <span className="ps-2 fs-5 fw-bolder">Tag</span>
                </a>
            </div>
        </nav>
    </>
}

type TagProps = {
    color?: string,
    name?: string,
    count?: number
}

const Tag: React.FC<TagProps> = ({
    color = "#FFA500",
    name = "fakeTagName",
    count = 3
}) => {
    return <>
        <div className="d-flex justify-content-start align-items-center ps-3 h-tagh">
            <span className="badge" style={{ backgroundColor: color }}>{count}</span>
            <span className="ps-2 fs-6">{name}</span>
        </div>
    </>
}

type AddTagButtonProps = {
    onClickHandler: () => void
}

const AddTagButton: React.FC<AddTagButtonProps> = ({ onClickHandler }) => {
    return <>
        <div
            className="d-flex justify-content-center align-items-center px-3 mt-2"
            onClick={onClickHandler}>
            <button
                type="button"
                className="btn btn-outline-secondary w-100">
                +
            </button>
        </div>
    </>
}

const TagList: React.FC = () => {
    const addTagRedcuer = useAppSelector((state) => state.tagListSliceRedcuer);
    const tagList = addTagRedcuer.tagList;
    const dispatch = useAppDispatch();

    function btnClickHandler() {
        dispatch(addTestTag());
    }


    return <>
        <div className='flex-fill overflow-y-auto overflow-x-hidden h-0 pt-3'>
            {
                tagList.map((data) => {
                    return <>
                        <Tag
                            color={data.color}
                            name={data.name}
                            count={data.count}
                        />
                    </>
                })
            }
            <AddTagButton onClickHandler={btnClickHandler} />
        </div>
    </>
}


const TagArea: React.FC = () => {
    return <>
        <div className="bg-white w-200px d-none d-lg-block d-lg-flex flex-column w-auto">
            <TagHeader />
            <TagList />
        </div>
    </>
};

export default TagArea;
