/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('locations').del();

  // Inserts seed entries
  await knex('locations').insert([
    { id: 1, name: 'Location 1', description: 'Description for Location 1', latitude: 40.7128, longitude: -74.0060 },
    { id: 2, name: 'Location 2', description: 'Description for Location 2', latitude: 34.0522, longitude: -118.2437 },
    { id: 3, name: 'Location 3', description: 'Description for Location 3', latitude: 41.8781, longitude: -87.6298 },
  ]);
};
