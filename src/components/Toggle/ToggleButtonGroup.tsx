import React, { FC, ReactElement } from 'react'
import ToggleButton, { ToggleButtonProps } from './ToggleButton'

interface ToggleButtonGroupProps {
    active: any
    children: ReactElement<ToggleButtonProps>[]
    className?: string
}

export const ToggleButtonGroup: FC<ToggleButtonGroupProps> = ({
    className = '',
    children,
    active,
}) => {
    const clones = []
    React.Children.forEach(children, (child, index) => {
        if (child?.type === ToggleButton) {
            clones.push(
                React.cloneElement(child, {
                    active: child.props.value === active,
                    key: index,
                })
            )
        }
    })

    return (
        <div
            className={`inline-flex items-center font-black whitespace-nowrap grid grid-flow-col h-full ${className}`}
        >
            {clones}
        </div>
    )
}

export default ToggleButtonGroup
