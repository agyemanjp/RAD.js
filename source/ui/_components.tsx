import { createElement, Fragment, type InputComponent, type InputProps, type InputHTMLAttributes, type CSSProperties } from "@agyemanjp/fxui"
import { type OmitX } from "@agyemanjp/standard"

export const InputAddress: InputComponent<InputAddressProps> = (props, setProps) => {
	const {
		value,
		onValueChanged,
		autoRefresh,
		suggestions,
		useCurrentLocation,
		style,
		children,
		...htmlProps
	} = props

	// Handler for fetching current location
	const handleUseCurrentLocation = async () => {
		if (!navigator.geolocation) {
			alert("Geolocation is not supported by your browser.")
			return
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords
				try {
					const response = await fetch(
						`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
					)
					const data = await response.json()
					const address = data.display_name || `Lat: ${latitude}, Long: ${longitude}`
					onValueChanged?.(address)
				} catch (error) {
					alert("Failed to fetch address from location.")
					console.error("Error in reverse geocoding:", error)
				}
			},
			() => {
				alert("Unable to retrieve your location.")
			}
		)
	}

	// Fetch suggestions from OpenStreetMap Nominatim API
	const fetchSuggestions = async (query: string) => {
		if (!query) return
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
			)
			const data = await response.json() as { display_name: string }[]
			const suggestions = data.map((item) => item.display_name)
			if (setProps) setProps(({ ...props, suggestions }))
		}
		catch (er) {
			console.error("Error fetching address suggestions:", er)
		}
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", ...style }}>
			<input
				type="text"
				value={value}
				onChange={(e) => {
					const newValue = e.target.value
					onValueChanged?.(newValue)
					fetchSuggestions(newValue)
				}}
				style={{ ...style }}
				{...htmlProps}
			/>

			{suggestions && suggestions.length > 0
				? <ul style={{ listStyle: "none", margin: "0", padding: "0.5em", border: "1px solid #ccc", borderRadius: "4px", background: "#fff", maxHeight: "200px", overflowY: "auto" }}>
					{suggestions.map((suggestion, index) => (
						<li
							data-peer-id={index}
							style={{ padding: "0.5em", cursor: "pointer" }}
							onClick={() => onValueChanged?.(suggestion)}>

							{suggestion}
						</li>
					))}
				</ul>

				: <></>
			}

			{useCurrentLocation
				? <button
					type="button"
					onClick={handleUseCurrentLocation}
					style={{ marginTop: "0.5em" }}>
					Use Current Location
				</button>

				: <></>
			}
		</div>
	)
}
type InputAddressProps = InputProps<string> & OmitX<InputHTMLAttributes<HTMLInputElement>, "type"> & {
	suggestions?: string[] // List of address suggestions
	useCurrentLocation?: boolean // Flag to enable "Use Current Location" feature
}


export const ToggleSwitch: InputComponent<ToggleSwitchProps> = (props, setProps) => {
	const { value, onValueChanged, style, onLabel = "On", offLabel = "Off" } = props

	const handleToggle = () => {
		if (setProps) setProps({ ...props, value: !props.value })
		onValueChanged?.(!value)
	}

	return <div
		onClick={handleToggle}
		style={{
			display: "flex",
			alignItems: "center",
			cursor: "pointer",
			background: value ? "#4caf50" : "#f44336",
			borderRadius: "20px",
			padding: "0.5em 1em",
			transition: "background 0.3s ease",
			...style,
		}}>

		<div
			style={{
				height: "20px",
				width: "20px",
				background: "#fff",
				borderRadius: "50%",
				boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
				transform: value ? "translateX(20px)" : "translateX(0)",
				transition: "transform 0.3s ease",
			}}
		/>

		<span
			style={{
				marginLeft: "10px",
				color: "#fff",
				fontWeight: "bold",
			}}>
			{value ? onLabel : offLabel}
		</span>
	</div>
}
type ToggleSwitchProps = {
	value: boolean // Current state of the toggle
	onValueChanged?: (newValue: boolean) => void // Callback for state changes
	style?: CSSProperties // Custom styles for the toggle
	onLabel?: string // Label to display when toggle is "On"
	offLabel?: string // Label to display when toggle is "Off"
}
