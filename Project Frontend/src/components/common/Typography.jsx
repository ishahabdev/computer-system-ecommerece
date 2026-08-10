import React from 'react'

const Typography = ({ varient, children, style, btn, size = "md" }) => {
    const TagVarient = {
        h1: "h1",
        h2: "h2",
        h3: "h3",
        h4: "h4",
        h5: "h5",
        h6: "h6",
        p: "p",
        small: "small"
    }

    const tagStyle = {
        h1: "text-18 md:text-[30px] lg:text-[45px]",
        h2: "text-16 md:text-[26px] lg:text-[40px]",
        h3: "text-14 md:text-[22px] lg:text-[25px]",
        h4: "text-14 md:text-[20px] lg:text-[23px]",
        h5: "text-12 md:text-[18px] lg:text-[22px]",
        h6: "text-12 md:text-[16px] lg:text-[18px]",
        p: "text-12 md:text-[14px] lg:text-[16px]",
        small: "text-10 md:text-[12px] lg:text-[14px]",
    }

    const btnStyle = {
        primary: "bg-[#2196F3] text-white rounded-lg hover:bg-blue-600 transition-colors",
        secondary: "bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors",
        white: "bg-white text-blue-500 rounded-lg hover:bg-gray-600 transition-colors",
        outline: "border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
    }

    const btnSizeStyle = {
        sm: "inline-block px-4 py-1.5 text-sm",
        md: "inline-block px-6 py-2 text-base",
        lg: "inline-block px-12 py-3 text-lg",
        xl:"inline-block px-14 py-4 text-xl",
    }

    const Tag = TagVarient[varient] || "p"
    const buttonStyleClass = btn ? btnStyle[btn] : ""
    const buttonSizeClass = btn ? (btnSizeStyle[size] || btnSizeStyle.md) : ""

    return (
        <Tag className={`${tagStyle[varient]} ${buttonStyleClass} ${buttonSizeClass} ${style || ""}`}>
            {children}
        </Tag>
    )
}

export default Typography