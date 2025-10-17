

export default function PriceFilter({filters,setFilters}){
    const handleMinPriceChange = (e) => {
        const value = e.target.value ? parseFloat(e.target.value) : null;
        setFilters({...filters, priceMin: value});
    }
    
    const handleMaxPriceChange = (e) => {
        const value = e.target.value ? parseFloat(e.target.value) : null;
        setFilters({...filters, priceMax: value});
    }

    return(
        <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Price Range</h2>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={filters.priceMin || ""}
                    onChange={handleMinPriceChange}
                    placeholder="Min Price"
                    className="w-1/2 p-2 border rounded"
                    min="0"
                />
                <span className="mx-1">-</span>
                <input
                    type="number"
                    value={filters.priceMax || ""}
                    onChange={handleMaxPriceChange}
                    placeholder="Max Price"
                    className="w-1/2 p-2 border rounded"
                    min="0"
                />
            </div>
        </div>
    )
}
