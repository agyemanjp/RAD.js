import { createElement, Fragment } from "@agyemanjp/fxui";
import {} from "@agyemanjp/standard";
export const InputAddress = (props, setProps) => {
    const { value, onValueChanged, autoRefresh, suggestions, useCurrentLocation, style, children, ...htmlProps } = props;
    // Handler for fetching current location
    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                const address = data.display_name || `Lat: ${latitude}, Long: ${longitude}`;
                onValueChanged?.(address);
            }
            catch (error) {
                alert("Failed to fetch address from location.");
                console.error("Error in reverse geocoding:", error);
            }
        }, () => {
            alert("Unable to retrieve your location.");
        });
    };
    // Fetch suggestions from OpenStreetMap Nominatim API
    const fetchSuggestions = async (query) => {
        if (!query)
            return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            const suggestions = data.map((item) => item.display_name);
            if (setProps)
                setProps(({ ...props, suggestions }));
        }
        catch (er) {
            console.error("Error fetching address suggestions:", er);
        }
    };
    return (createElement("div", { style: { display: "flex", flexDirection: "column", ...style } },
        createElement("input", { type: "text", value: value, onChange: (e) => {
                const newValue = e.target.value;
                onValueChanged?.(newValue);
                fetchSuggestions(newValue);
            }, style: { ...style }, ...htmlProps }),
        suggestions && suggestions.length > 0
            ? createElement("ul", { style: { listStyle: "none", margin: "0", padding: "0.5em", border: "1px solid #ccc", borderRadius: "4px", background: "#fff", maxHeight: "200px", overflowY: "auto" } }, suggestions.map((suggestion, index) => (createElement("li", { "data-peer-id": index, style: { padding: "0.5em", cursor: "pointer" }, onClick: () => onValueChanged?.(suggestion) }, suggestion))))
            : createElement(Fragment, null),
        useCurrentLocation
            ? createElement("button", { type: "button", onClick: handleUseCurrentLocation, style: { marginTop: "0.5em" } }, "Use Current Location")
            : createElement(Fragment, null)));
};
export const ToggleSwitch = (props, setProps) => {
    const { value, onValueChanged, style, onLabel = "On", offLabel = "Off" } = props;
    const handleToggle = () => {
        if (setProps)
            setProps({ ...props, value: !props.value });
        onValueChanged?.(!value);
    };
    return createElement("div", { onClick: handleToggle, style: {
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            background: value ? "#4caf50" : "#f44336",
            borderRadius: "20px",
            padding: "0.5em 1em",
            transition: "background 0.3s ease",
            ...style,
        } },
        createElement("div", { style: {
                height: "20px",
                width: "20px",
                background: "#fff",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                transform: value ? "translateX(20px)" : "translateX(0)",
                transition: "transform 0.3s ease",
            } }),
        createElement("span", { style: {
                marginLeft: "10px",
                color: "#fff",
                fontWeight: "bold",
            } }, value ? onLabel : offLabel));
};
//# sourceMappingURL=_components.js.map