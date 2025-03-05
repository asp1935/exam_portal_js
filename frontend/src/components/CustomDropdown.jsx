import { useState } from "react";
import PropTypes from 'prop-types';

const CustomDropdown = ({ options, selectedValue, setSelectedValue, placeholder, labelKey, disable = false, dwidth = 25, dheigth = 15, noSelect = false }) => {
    const [searchText, setSearchText] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Get selected item name dynamically
    const selectedItem = options?.data.find(option => option.id === selectedValue);
    const selectedName = selectedItem ? selectedItem[labelKey] : placeholder;

    // Filter options based on search input
    const filteredOptions = options?.data.filter(option =>
        option[labelKey]?.toLowerCase().includes(searchText?.toLowerCase())
    );
    return (
        <div className='relative inline-block text-left  ms-3 ' style={{ width: `${dwidth}vw` }}>
            {/* Selected Item Display */}
            <div
                className={`w-full border p-2 rounded-md bg-white text-sm ${disable ? "cursor-not-allowed opacity-50 pointer-events-none " : "cursor-pointer"
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedName}
            </div>

            {/* Dropdown List */}
            {isOpen && (
                <div className="absolute w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 z-10 ">
                    {/* Search Input */}
                    <input
                        type="text"
                        className="w-full border-b p-2 text-sm"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                    />

                    {/* Options List (Fixed Height & Scroll) */}
                    <div className=" overflow-y-auto" style={{ maxHeight: `${dheigth}vh` }}>
                        {noSelect && (<div
                            className={`px-2 py-1 hover:bg-gray-200 cursor-pointer ${selectedValue === null ? "bg-gray-300" : ""
                                }`}
                            onClick={() => {
                                setSelectedValue(null);
                                setIsOpen(false);
                                setSearchText(""); // Reset search on selection
                            }}
                        >
                            All 
                        </div>
                        )}

                        {filteredOptions?.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className={`px-2 py-1 hover:bg-gray-200 cursor-pointer ${selectedValue === option.id ? "bg-gray-300" : ""
                                        }`}
                                    onClick={() => {
                                        setSelectedValue(option.id);
                                        setIsOpen(false);
                                        setSearchText(""); // Reset search on selection
                                    }}
                                >
                                    {option[labelKey]}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-gray-500">No results found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


CustomDropdown.propTypes = {
    options: PropTypes.object,
    selectedValue: PropTypes.number,
    setSelectedValue: PropTypes.func,
    placeholder: PropTypes.string,
    labelKey: PropTypes.string,
    disable: PropTypes.bool,
    dwidth: PropTypes.number,
    dheigth: PropTypes.number,
    noSelect: PropTypes.bool,
}

export default CustomDropdown;
