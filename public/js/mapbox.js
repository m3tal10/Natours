/*eslint-disable*/

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibTN0YWwxMCIsImEiOiJjbHpzNDEyem0yM2F4MmtzaTRsa24yZGxrIn0.LYHludcqlPNnYjzJhl_kTQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/m3tal10/clzs85hin00e801qt3jl037to',
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';
    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    //Add popup on the markers
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    //extend map bounds to fit current location
    bounds.extend(loc.coordinates);
  });

  //fit map to the marker bounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
