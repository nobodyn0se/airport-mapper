function SearchPane() {
    return (
        <div className="mb-4">
            <input
                type="text"
                placeholder="Enter airport code"
                className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Add Airport
            </button>
        </div>
    )
}

export default SearchPane;