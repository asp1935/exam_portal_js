import React, { useState } from 'react'
import PropTypes from 'prop-types';

function DropdownList({
    options = [], // Ensures `options` is always an array
    selectedValue,
    setSelectedValue,
    placeholder = "Select...",
    disable = false,
    dwidth = 25,
    dheigth = 15,
    noSelect = false
}) {
    const [searchText, setSearchText] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Ensure options is an array
    const normalizedOptions = Array.isArray(options) ?
        options.map((option) =>
            typeof option === "object" ? option : { id: option, label: option }
        )
        : [];

    // Get selected item name dynamically
    const selectedItem = normalizedOptions.find(option => option.id === selectedValue);
    const selectedName = selectedItem ? selectedItem.label : placeholder;

    // Filter options based on search input
    const filteredOptions = normalizedOptions.filter(option =>
        option.label.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    return (
        <div className='relative inline-block text-left ms-3' style={{ width: `${dwidth}vw` }}>
            {/* Selected Item Display */}
            <div
                className={`w-full border p-2 rounded-md bg-white text-sm ${disable ? "cursor-not-allowed opacity-50 pointer-events-none" : "cursor-pointer"
                    }`}
                onClick={() => !disable && setIsOpen(!isOpen)}
            >
                {selectedName}
            </div>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 z-10">
                    {/* Search Input */}
                    <input
                        type="text"
                        className="w-full border-b p-2 text-sm"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                    />

                    {/* Options List */}
                    <div className="overflow-y-auto" style={{ maxHeight: `${dheigth}vh` }}>
                        {noSelect && (
                            <div
                                className={`px-2 py-1 hover:bg-gray-200 cursor-pointer ${selectedValue === null ? "bg-gray-300" : ""}`}
                                onClick={() => {
                                    setSelectedValue(null);
                                    setIsOpen(false);
                                    setSearchText("");
                                }}
                            >
                                All
                            </div>
                        )}

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`px-2 py-1 hover:bg-gray-200 cursor-pointer ${selectedValue === option.id ? "bg-gray-300" : ""}`}
                                    onClick={() => {
                                        setSelectedValue(option.id);
                                        setIsOpen(false);
                                        setSearchText("");
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-gray-500">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
DropdownList.propTypes = {
    options: PropTypes.array,
    selectedValue: PropTypes.number,
    setSelectedValue: PropTypes.func,
    placeholder: PropTypes.string,
    labelKey: PropTypes.string,
    disable: PropTypes.bool,
    dwidth: PropTypes.number,
    dheigth: PropTypes.number,
    noSelect: PropTypes.bool,
}
export default DropdownList
