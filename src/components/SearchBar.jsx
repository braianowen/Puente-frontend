const SearchBar = ({ value, onChange }) => (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Buscar instrumentos por símbolo o nombre..."
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute left-3 top-3.5 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
  
  export default SearchBar;