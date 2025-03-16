let mappers = [];

// the mapper files will add to this array
console.log("Initializing NES mappers array");

// Export mappers array globally
window.mappers = mappers;

// Register NINA-03/06 mapper (79)
mappers[79] = Nina;
