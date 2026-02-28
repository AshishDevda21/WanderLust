(() => {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") return;

  const defaultCoords = [20.5937, 78.9629];
  const label =
    typeof listingLocation === "string" && listingLocation.trim().length > 0
      ? listingLocation
      : "India";

  const map = L.map("map").setView(defaultCoords, 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const marker = L.marker(defaultCoords).addTo(map).bindPopup(label);

  const centerFromLocation = async () => {
    if (typeof listingLocation !== "string" || !listingLocation.trim()) {
      marker.openPopup();
      return;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        listingLocation
      )}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Geocoding request failed");

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        throw new Error("No geocoding results");
      }

      const lat = Number(results[0].lat);
      const lng = Number(results[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new Error("Invalid coordinates from geocoder");
      }

      map.setView([lat, lng], 9);
      marker.setLatLng([lat, lng]).setPopupContent(label).openPopup();
    } catch (error) {
      marker.setPopupContent(`${label} (approximate)`).openPopup();
      console.error("Unable to geocode listing location:", error);
    }
  };

  centerFromLocation();
})();
