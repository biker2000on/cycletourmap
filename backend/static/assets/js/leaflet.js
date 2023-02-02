function map_init_basic(map, options) {
    let url = location.pathname + '/activities'
    fetch(url, {
            mode: 'no-cors'
        })
        .then((response) => response.json())
        .then((data) => {
            L.geoJSON(data.features, {
                onEachFeature: function (feature, layer) {
                    let d = new Date(feature.properties.start_date)
                    layer.bindPopup(`
                    <ul class="list-unstyled">
                        <li>${feature.properties.name}</li>
                        <li>Start Time: ${d.toLocaleDateString()}</li>
                        <li>Distance: ${(feature.properties.distance / 1609.34).toFixed(2)} mi</li>
                        <li>Moving Time: ${(feature.properties.moving_time / 3600).toFixed(2)} hrs</li>
                        <li>Elapsed Time: ${(feature.properties.elapsed_time / 3600).toFixed(2)} hrs</li>
                        </ul>
                        `)
                }
            }).addTo(map)
            console.log(data.features)
        });


}