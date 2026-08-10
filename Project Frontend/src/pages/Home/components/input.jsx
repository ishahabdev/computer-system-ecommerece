import React from 'react';

const InputField = ({ name, type, value, onChange }) => {
    return (
        <div>
            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className="bg-gray-200 px-2 py-4 rounded-md w-full"
            />
        </div>
    );
};

export default InputField;