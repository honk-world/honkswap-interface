import React, { FC } from 'react'

interface ListHeaderProps {
    className?: string
}

const ListHeader: FC<ListHeaderProps> = ({ children, className = '' }) => {
    return (
        <div
            className={`flex items-center cursor-pointer hover:text-primary text-sm ${className}`}
        >
            <div>{children}</div>
        </div>
    )
}

export default ListHeader
