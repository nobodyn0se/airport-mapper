function SuggestedAirport(props) {
    return <>
        <div className="flex justify-between items-center">
            <div>
                <span className="font-bold text-base mr-1">{props.item.icao}</span>
                <span className="text-sm text-gray-500">{props.item.iata}</span>
            </div>
            <span
                className="text-sm text-gray-500 truncate max-w-[90px] text-right">{props.item.municipality}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1 truncate">{props.item.name}</div>
    </>;
}

export default SuggestedAirport;